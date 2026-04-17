'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNav } from '../dashboard/page'

interface Customer {
  id: string; email: string; name: string; phone: string | null
  status: 'active' | 'inactive' | 'disabled'; email_verified: boolean; created_at: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active:   { bg: 'rgba(40,120,181,0.12)',  text: '#5BA3D9', border: 'rgba(40,120,181,0.3)' },
  inactive: { bg: 'rgba(245,194,0,0.1)',   text: '#F5C200', border: 'rgba(245,194,0,0.3)' },
  disabled: { bg: 'rgba(220,50,50,0.1)',   text: '#ff8080', border: 'rgba(220,50,50,0.25)' },
}

const inputClass = "border rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [editForm, setEditForm] = useState({ status: '', password: '' })
  const [saving, setSaving] = useState(false)

  const fetchCustomers = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/customers?${params}`)
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setCustomers(data.customers || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [router, statusFilter, search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const body: Record<string, string> = { customerId: selected.id }
    if (editForm.status) body.status = editForm.status
    if (editForm.password) body.password = editForm.password
    await fetch('/api/admin/customers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    setSelected(null)
    fetchCustomers()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      <AdminNav onLogout={handleLogout} current="customers" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Customers</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{total} total customers</p>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className={`${inputClass} w-52`} style={inputStyle} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2878B5' }} /> Active = paid & has access</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F5C200' }} /> Inactive = signed up, no paid orders</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff8080' }} /> Disabled = blocked from portal</div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Customer', 'Phone', 'Status', 'Portal Access', 'Joined', ''].map((h, i) => (
                      <th key={i} className="text-left font-medium px-5 py-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => {
                    const sc = STATUS_COLORS[c.status]
                    return (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.email}</div>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.phone || '—'}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg border" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs" style={{ color: c.email_verified ? '#5BA3D9' : 'rgba(255,255,255,0.3)' }}>
                            {c.email_verified ? '✓ Password set' : '✗ No password'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(c.created_at).toLocaleDateString('en-BD')}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => { setSelected(c); setEditForm({ status: c.status, password: '' }) }}
                            className="text-xs font-semibold" style={{ color: '#F5C200' }}>Edit</button>
                        </td>
                      </tr>
                    )
                  })}
                  {!customers.length && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No customers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="rounded-2xl p-6 w-full max-w-md border border-white/15" style={{ backgroundColor: '#2e2e2e' }}>
            <h3 className="font-bold mb-1 text-white">Edit Customer</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>{selected.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none border" style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Set Portal Password</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none border" style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }} />
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Setting a password allows the customer to log into the portal</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)} className="flex-1 font-semibold py-2.5 rounded-xl text-sm border border-white/10 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 font-bold py-2.5 rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
