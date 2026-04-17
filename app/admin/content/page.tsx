'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AdminNav } from '../dashboard/page'
import { Product, CourseModule, CourseLesson, DigitalAsset } from '@/types/shop'

function ContentManager() {
  const router = useRouter()
  const params = useSearchParams()
  const productId = params.get('productId')

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modules, setModules] = useState<(CourseModule & { course_lessons: CourseLesson[] })[]>([])
  const [assets, setAssets] = useState<DigitalAsset[]>([])
  const [loading, setLoading] = useState(false)

  // Add forms
  const [addingModule, setAddingModule] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [addingLesson, setAddingLesson] = useState<string | null>(null)
  const [newLesson, setNewLesson] = useState({ title: '', video_url: '', video_embed_url: '', duration_minutes: '', is_preview: false })
  const [addingAsset, setAddingAsset] = useState(false)
  const [newAsset, setNewAsset] = useState({ name: '', file_url: '', file_type: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null } return r.json() })
      .then(data => { if (data) setProducts(data) })
  }, [router])

  useEffect(() => {
    if (productId) {
      const p = products.find(p => p.id === productId)
      if (p) setSelectedProduct(p)
    }
  }, [productId, products])

  useEffect(() => {
    if (!selectedProduct) return
    setLoading(true)
    fetch(`/api/admin/content?productId=${selectedProduct.id}`)
      .then(r => r.json())
      .then(data => { setModules(data.modules || []); setAssets(data.assets || []); setLoading(false) })
  }, [selectedProduct])

  const addModule = async () => {
    if (!selectedProduct || !newModuleTitle) return
    setSaving(true)
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'module', product_id: selectedProduct.id, title: newModuleTitle, position: modules.length }),
    })
    setSaving(false)
    setAddingModule(false)
    setNewModuleTitle('')
    refreshContent()
  }

  const addLesson = async (moduleId: string) => {
    setSaving(true)
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'lesson',
        module_id: moduleId,
        title: newLesson.title,
        video_url: newLesson.video_url || null,
        video_embed_url: newLesson.video_embed_url || null,
        duration_minutes: newLesson.duration_minutes ? parseInt(newLesson.duration_minutes) : null,
        is_preview: newLesson.is_preview,
        position: modules.find(m => m.id === moduleId)?.course_lessons?.length || 0,
      }),
    })
    setSaving(false)
    setAddingLesson(null)
    setNewLesson({ title: '', video_url: '', video_embed_url: '', duration_minutes: '', is_preview: false })
    refreshContent()
  }

  const addAsset = async () => {
    if (!selectedProduct || !newAsset.name || !newAsset.file_url) return
    setSaving(true)
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'asset', product_id: selectedProduct.id, ...newAsset }),
    })
    setSaving(false)
    setAddingAsset(false)
    setNewAsset({ name: '', file_url: '', file_type: '' })
    refreshContent()
  }

  const deleteItem = async (type: string, id: string) => {
    if (!confirm('Delete this item?')) return
    await fetch('/api/admin/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    })
    refreshContent()
  }

  const refreshContent = () => {
    if (!selectedProduct) return
    fetch(`/api/admin/content?productId=${selectedProduct.id}`)
      .then(r => r.json())
      .then(data => { setModules(data.modules || []); setAssets(data.assets || []) })
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const isVideoProduct = selectedProduct?.item_type === 'Video Course'
  const isDigitalProduct = ['Digital File', 'PDF'].includes(selectedProduct?.item_type || '')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminNav onLogout={handleLogout} current="content" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black">Content Manager</h1>
          <p className="text-white/40 text-sm mt-1">Upload and manage course videos and digital downloads</p>
        </div>

        {/* Product Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-white/60 mb-2">Select Product</label>
          <select
            value={selectedProduct?.id || ''}
            onChange={e => {
              const p = products.find(p => p.id === e.target.value)
              setSelectedProduct(p || null)
              router.push(p ? `/admin/content?productId=${p.id}` : '/admin/content')
            }}
            className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50 min-w-64"
          >
            <option value="">— Choose a product —</option>
            {products.filter(p => p.item_type === 'Video Course' || p.item_type === 'Digital File' || p.item_type === 'PDF').map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.item_type})</option>
            ))}
          </select>
        </div>

        {selectedProduct && loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {selectedProduct && !loading && (
          <>
            {/* Video Course Content */}
            {isVideoProduct && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Course Modules & Lessons</h2>
                  <button
                    onClick={() => setAddingModule(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Module
                  </button>
                </div>

                {addingModule && (
                  <div className="bg-white/5 border border-amber-400/30 rounded-xl p-4 flex gap-3">
                    <input
                      autoFocus
                      value={newModuleTitle}
                      onChange={e => setNewModuleTitle(e.target.value)}
                      placeholder="Module title..."
                      className="flex-1 bg-transparent border-b border-white/20 py-1 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400"
                    />
                    <button onClick={addModule} disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-3 py-1.5 rounded-lg">Save</button>
                    <button onClick={() => setAddingModule(false)} className="text-white/30 hover:text-white text-xs">Cancel</button>
                  </div>
                )}

                {modules.map(module => (
                  <div key={module.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                      <h3 className="font-semibold text-sm">{module.title}</h3>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setAddingLesson(module.id)} className="text-xs text-amber-400 hover:text-amber-300 font-semibold">+ Add Lesson</button>
                        <button onClick={() => deleteItem('module', module.id)} className="text-xs text-red-400/60 hover:text-red-400">Delete</button>
                      </div>
                    </div>

                    {module.course_lessons?.length > 0 && (
                      <div className="divide-y divide-white/5">
                        {module.course_lessons.sort((a, b) => a.position - b.position).map(lesson => (
                          <div key={lesson.id} className="flex items-center gap-4 px-5 py-3">
                            <span className="text-white/20 text-xs font-mono w-4">{lesson.position + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium flex items-center gap-2">
                                {lesson.title}
                                {lesson.is_preview && <span className="text-xs bg-blue-400/10 text-blue-400 border border-blue-400/20 px-1.5 py-0.5 rounded">Preview</span>}
                              </div>
                              {lesson.video_url && <div className="text-xs text-white/30 truncate mt-0.5">{lesson.video_url}</div>}
                              {lesson.duration_minutes && <div className="text-xs text-white/30">{lesson.duration_minutes} min</div>}
                            </div>
                            <button onClick={() => deleteItem('lesson', lesson.id)} className="text-xs text-red-400/40 hover:text-red-400 flex-shrink-0">×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {addingLesson === module.id && (
                      <div className="px-5 py-4 bg-white/3 border-t border-white/5 space-y-3">
                        <input value={newLesson.title} onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))} placeholder="Lesson title *" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50" />
                        <input value={newLesson.video_url} onChange={e => setNewLesson(l => ({ ...l, video_url: e.target.value }))} placeholder="Video URL (YouTube, Vimeo, direct link)" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50" />
                        <input value={newLesson.video_embed_url} onChange={e => setNewLesson(l => ({ ...l, video_embed_url: e.target.value }))} placeholder="Embed URL (e.g. youtube.com/embed/...)" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50" />
                        <div className="flex items-center gap-3">
                          <input type="number" value={newLesson.duration_minutes} onChange={e => setNewLesson(l => ({ ...l, duration_minutes: e.target.value }))} placeholder="Duration (minutes)" className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 w-40" />
                          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                            <input type="checkbox" checked={newLesson.is_preview} onChange={e => setNewLesson(l => ({ ...l, is_preview: e.target.checked }))} className="accent-amber-400" />
                            Free preview
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addLesson(module.id)} disabled={saving || !newLesson.title} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs px-4 py-2 rounded-lg">Save Lesson</button>
                          <button onClick={() => setAddingLesson(null)} className="text-white/30 hover:text-white text-xs">Cancel</button>
                        </div>
                      </div>
                    )}

                    {!module.course_lessons?.length && addingLesson !== module.id && (
                      <div className="px-5 py-4 text-white/25 text-sm text-center">No lessons yet</div>
                    )}
                  </div>
                ))}

                {!modules.length && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl py-12 text-center text-white/30">
                    No modules yet. Add your first module above.
                  </div>
                )}
              </div>
            )}

            {/* Digital Downloads */}
            {isDigitalProduct && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">Digital Files</h2>
                  <button onClick={() => setAddingAsset(true)} className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add File
                  </button>
                </div>

                {addingAsset && (
                  <div className="bg-white/5 border border-amber-400/30 rounded-xl p-4 space-y-3">
                    <input value={newAsset.name} onChange={e => setNewAsset(a => ({ ...a, name: e.target.value }))} placeholder="File name *" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none" />
                    <input value={newAsset.file_url} onChange={e => setNewAsset(a => ({ ...a, file_url: e.target.value }))} placeholder="File URL (Supabase storage, Google Drive, etc.) *" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none" />
                    <input value={newAsset.file_type} onChange={e => setNewAsset(a => ({ ...a, file_type: e.target.value }))} placeholder="File type (pdf, xlsx, docx...)" className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none" />
                    <div className="flex gap-2">
                      <button onClick={addAsset} disabled={saving || !newAsset.name || !newAsset.file_url} className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs px-4 py-2 rounded-lg">Save</button>
                      <button onClick={() => setAddingAsset(false)} className="text-white/30 hover:text-white text-xs">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
                  {assets.map(asset => (
                    <div key={asset.id} className="flex items-center gap-4 px-5 py-4">
                      <span className="text-2xl">{asset.file_type === 'pdf' ? '📄' : asset.file_type === 'xlsx' ? '📊' : '💾'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{asset.name}</div>
                        <div className="text-xs text-white/30 truncate mt-0.5">{asset.file_url}</div>
                      </div>
                      {asset.file_type && <span className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded">.{asset.file_type}</span>}
                      <button onClick={() => deleteItem('asset', asset.id)} className="text-red-400/40 hover:text-red-400 text-sm">×</button>
                    </div>
                  ))}
                  {!assets.length && (
                    <div className="py-10 text-center text-white/25 text-sm">No files uploaded yet</div>
                  )}
                </div>
              </div>
            )}

            {!isVideoProduct && !isDigitalProduct && (
              <div className="bg-white/5 border border-white/10 rounded-2xl py-12 text-center text-white/40">
                <p>Content management is not applicable for <strong className="text-white/60">{selectedProduct.item_type}</strong> products.</p>
                <p className="text-sm mt-2">Physical books and coaching sessions are managed through orders.</p>
              </div>
            )}
          </>
        )}

        {!selectedProduct && (
          <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center text-white/30">
            <div className="text-4xl mb-3">🎬</div>
            <p>Select a product above to manage its content</p>
            <Link href="/admin/products" className="inline-block mt-4 text-amber-400 text-sm hover:text-amber-300">View all products →</Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default function AdminContentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ContentManager />
    </Suspense>
  )
}
