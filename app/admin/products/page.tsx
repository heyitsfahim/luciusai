'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminNav } from '../dashboard/page'
import { Product } from '@/types/shop'
import { DOMAIN_ORDER, ITEM_TYPE_COLORS, ITEM_TYPE_ICONS, formatBDT } from '@/lib/shop-db'

const fieldInputClass = "w-full border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
const fieldInputStyle = { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ domain: DOMAIN_ORDER[0], name: '', item_type: 'Digital File', price_bdt: 0, description: '' })

  const refreshProducts = async () => {
    const res = await fetch('/api/admin/products')
    if (res.status === 401) { router.push('/admin/login'); return }
    setProducts(await res.json())
  }

  useEffect(() => {
    refreshProducts().then(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    setSaving(false)
    setEditing(null)
    refreshProducts()
  }

  const handleAdd = async () => {
    setSaving(true)
    await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProduct) })
    setSaving(false)
    setShowAdd(false)
    setNewProduct({ domain: DOMAIN_ORDER[0], name: '', item_type: 'Digital File', price_bdt: 0, description: '' })
    refreshProducts()
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
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      <AdminNav onLogout={handleLogout} current="products" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Products</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{products.length} products across {Object.keys(productsByDomain).length} domains</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(productsByDomain).map(([domain, domainProducts]) => (
              <div key={domain}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#F5C200' }} />
                  <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>{domain}</h2>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Name', 'Type', 'Price', 'Status', ''].map((h, i) => (
                          <th key={i} className="text-left font-medium px-5 py-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {domainProducts.map(product => (
                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3 font-medium max-w-xs">
                            <div className="line-clamp-1 text-white">{product.name}</div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${ITEM_TYPE_COLORS[product.item_type] || 'bg-white/10 text-white/60 border border-white/20'}`}>
                              {ITEM_TYPE_ICONS[product.item_type]} {product.item_type}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-semibold" style={{ color: '#F5C200' }}>{formatBDT(product.price_bdt)}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-semibold px-2 py-1 rounded-lg border" style={product.is_active
                              ? { backgroundColor: 'rgba(40,120,181,0.1)', color: '#5BA3D9', borderColor: 'rgba(40,120,181,0.25)' }
                              : { backgroundColor: 'rgba(220,50,50,0.1)', color: '#ff8080', borderColor: 'rgba(220,50,50,0.25)' }
                            }>
                              {product.is_active ? 'Active' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setEditing({ ...product })} className="text-xs font-semibold" style={{ color: '#F5C200' }}>Edit</button>
                              <Link href={`/admin/content?productId=${product.id}`} className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Content</Link>
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
        <Modal title="Edit Product" onClose={() => setEditing(null)} onSave={handleSave} saving={saving}>
          <Field label="Name"><input value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} className={fieldInputClass} style={fieldInputStyle} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Domain">
              <select value={editing.domain} onChange={e => setEditing(p => p ? { ...p, domain: e.target.value } : p)} className={fieldInputClass} style={fieldInputStyle}>
                {DOMAIN_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={editing.item_type} onChange={e => setEditing(p => p ? { ...p, item_type: e.target.value as Product['item_type'] } : p)} className={fieldInputClass} style={fieldInputStyle}>
                {['Physical Book', 'Video Course', 'PDF', 'Digital File', 'In-Person or One-on-One'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (BDT)"><input type="number" min="0" value={editing.price_bdt} onChange={e => setEditing(p => p ? { ...p, price_bdt: parseInt(e.target.value) || 0 } : p)} className={fieldInputClass} style={fieldInputStyle} /></Field>
            <Field label="Position"><input type="number" min="0" value={editing.position} onChange={e => setEditing(p => p ? { ...p, position: parseInt(e.target.value) || 0 } : p)} className={fieldInputClass} style={fieldInputStyle} /></Field>
          </div>
          <Field label="Description"><textarea value={editing.description || ''} onChange={e => setEditing(p => p ? { ...p, description: e.target.value } : p)} rows={2} className={`${fieldInputClass} resize-none`} style={fieldInputStyle} /></Field>
          <div className="flex items-center gap-3">
            <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Active (visible on shop)</label>
            <button onClick={() => setEditing(p => p ? { ...p, is_active: !p.is_active } : p)} className="w-10 h-6 rounded-full transition-colors relative" style={{ backgroundColor: editing.is_active ? '#F5C200' : 'rgba(255,255,255,0.2)' }}>
              <span className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" style={{ left: editing.is_active ? '1.25rem' : '0.25rem' }} />
            </button>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Product" onClose={() => setShowAdd(false)} onSave={handleAdd} saving={saving} disabled={!newProduct.name}>
          <Field label="Name"><input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className={fieldInputClass} style={fieldInputStyle} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Domain">
              <select value={newProduct.domain} onChange={e => setNewProduct(p => ({ ...p, domain: e.target.value }))} className={fieldInputClass} style={fieldInputStyle}>
                {DOMAIN_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={newProduct.item_type} onChange={e => setNewProduct(p => ({ ...p, item_type: e.target.value }))} className={fieldInputClass} style={fieldInputStyle}>
                {['Physical Book', 'Video Course', 'PDF', 'Digital File', 'In-Person or One-on-One'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Price (BDT)"><input type="number" min="0" value={newProduct.price_bdt} onChange={e => setNewProduct(p => ({ ...p, price_bdt: parseInt(e.target.value) || 0 }))} className={fieldInputClass} style={fieldInputStyle} /></Field>
          <Field label="Description"><textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} rows={2} className={`${fieldInputClass} resize-none`} style={fieldInputStyle} /></Field>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, children, onClose, onSave, saving, disabled }: {
  title: string; children: React.ReactNode
  onClose: () => void; onSave: () => void; saving: boolean; disabled?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/15" style={{ backgroundColor: '#2e2e2e' }}>
        <h3 className="font-bold mb-5 text-white">{title}</h3>
        <div className="space-y-4">{children}</div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 font-semibold py-2.5 rounded-xl text-sm border border-white/10 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>Cancel</button>
          <button onClick={onSave} disabled={saving || disabled} className="flex-1 font-bold py-2.5 rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
