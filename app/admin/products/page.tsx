'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminNav } from '../dashboard/page'
import { Product } from '@/types/shop'
import { DOMAIN_ORDER, ITEM_TYPE_COLORS, ITEM_TYPE_ICONS, formatBDT } from '@/lib/shop-db'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ domain: DOMAIN_ORDER[0], name: '', item_type: 'Digital File', price_bdt: 0, description: '' })

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null } return r.json() })
      .then(data => { if (data) { setProducts(data); setLoading(false) } })
  }, [router])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setSaving(false)
    setEditing(null)
    const res = await fetch('/api/admin/products')
    setProducts(await res.json())
  }

  const handleAdd = async () => {
    setSaving(true)
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
    setSaving(false)
    setShowAdd(false)
    setNewProduct({ domain: DOMAIN_ORDER[0], name: '', item_type: 'Digital File', price_bdt: 0, description: '' })
    const res = await fetch('/api/admin/products')
    setProducts(await res.json())
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const productsByDomain = DOMAIN_ORDER.reduce((acc, d) => {
    const dp = products.filter(p => p.domain === d)
    if (dp.length) acc[d] = dp
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminNav onLogout={handleLogout} current="products" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">Products</h1>
            <p className="text-white/40 text-sm mt-1">{products.length} products across {Object.keys(productsByDomain).length} domains</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(productsByDomain).map(([domain, domainProducts]) => (
              <div key={domain}>
                <h2 className="font-bold text-white/70 text-sm uppercase tracking-wider mb-3">{domain}</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/40 font-medium px-5 py-3">Name</th>
                        <th className="text-left text-white/40 font-medium px-5 py-3">Type</th>
                        <th className="text-left text-white/40 font-medium px-5 py-3">Price</th>
                        <th className="text-left text-white/40 font-medium px-5 py-3">Status</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {domainProducts.map(product => (
                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3 font-medium max-w-xs">
                            <div className="line-clamp-1">{product.name}</div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${ITEM_TYPE_COLORS[product.item_type] || 'bg-gray-100 text-gray-800'}`}>
                              {ITEM_TYPE_ICONS[product.item_type]} {product.item_type}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-semibold text-amber-400">{formatBDT(product.price_bdt)}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${product.is_active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                              {product.is_active ? 'Active' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setEditing({ ...product })}
                                className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                              >
                                Edit
                              </button>
                              <Link
                                href={`/admin/content?productId=${product.id}`}
                                className="text-xs text-white/40 hover:text-white/70 font-semibold transition-colors"
                              >
                                Content
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-[#111] border border-white/15 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-5">Edit Product</h3>
            <div className="space-y-4">
              <Field label="Name">
                <input value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Domain">
                  <select value={editing.domain} onChange={e => setEditing(p => p ? { ...p, domain: e.target.value } : p)} className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50">
                    {DOMAIN_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Type">
                  <select value={editing.item_type} onChange={e => setEditing(p => p ? { ...p, item_type: e.target.value as Product['item_type'] } : p)} className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50">
                    {['Physical Book', 'Video Course', 'PDF', 'Digital File', 'In-Person or One-on-One'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (BDT)">
                  <input type="number" min="0" value={editing.price_bdt} onChange={e => setEditing(p => p ? { ...p, price_bdt: parseInt(e.target.value) || 0 } : p)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                </Field>
                <Field label="Position">
                  <input type="number" min="0" value={editing.position} onChange={e => setEditing(p => p ? { ...p, position: parseInt(e.target.value) || 0 } : p)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                </Field>
              </div>
              <Field label="Description">
                <textarea value={editing.description || ''} onChange={e => setEditing(p => p ? { ...p, description: e.target.value } : p)} rows={2} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" />
              </Field>
              <div className="flex items-center gap-3">
                <label className="text-sm text-white/60">Active (visible on shop)</label>
                <button
                  onClick={() => setEditing(p => p ? { ...p, is_active: !p.is_active } : p)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${editing.is_active ? 'bg-amber-400' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editing.is_active ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-[#111] border border-white/15 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="font-bold mb-5">Add Product</h3>
            <div className="space-y-4">
              <Field label="Name">
                <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Domain">
                  <select value={newProduct.domain} onChange={e => setNewProduct(p => ({ ...p, domain: e.target.value }))} className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50">
                    {DOMAIN_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Type">
                  <select value={newProduct.item_type} onChange={e => setNewProduct(p => ({ ...p, item_type: e.target.value }))} className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50">
                    {['Physical Book', 'Video Course', 'PDF', 'Digital File', 'In-Person or One-on-One'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Price (BDT)">
                <input type="number" min="0" value={newProduct.price_bdt} onChange={e => setNewProduct(p => ({ ...p, price_bdt: parseInt(e.target.value) || 0 }))} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
              </Field>
              <Field label="Description">
                <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" />
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !newProduct.name} className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
