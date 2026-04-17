'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNav } from '../dashboard/page'

interface Customer {
  id: string; email: string; name: string; phone: string | null
  status: 'active' | 'inactive' | 'disabled'; email_verified: boolean; created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-400/10 text-green-400 border border-green-400/20',
  inactive: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  disabled: 'bg-red-400/10 text-red-400 border border-red-400/20',
}

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

    await fetch('/api/admin/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    setSelected(null)
    fetchCustomers()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminNav onLogout={handleLogout} current="customers" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">Customers</h1>
            <p className="text-white/40 text-sm mt-1">{total} total customers</p>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 w-52"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-white/50">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /> Active = paid & has access</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Inactive = signed up, no paid orders</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Disabled = blocked from portal</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 font-medium px-5 py-3">Customer</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Phone</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Status</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Portal Access</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Joined</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-white/40 text-xs">{customer.email}</div>
                      </td>
                      <td className="px-5 py-3 text-white/60 text-xs">{customer.phone || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[customer.status] || ''}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs ${customer.email_verified ? 'text-green-400' : 'text-white/30'}`}>
                          {customer.email_verified ? '✓ Password set' : '✗ No password'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/40 text-xs">{new Date(customer.created_at).toLocaleDateString('en-BD')}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => { setSelected(customer); setEditForm({ status: customer.status, password: '' }) }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!customers.length && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-white/30">No customers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-[#111] border border-white/15 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold mb-1">Edit Customer</h3>
            <p className="text-white/40 text-sm mb-5">{selected.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Set Portal Password</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50"
                />
                <p className="text-white/30 text-xs mt-1.5">Setting a password allows the customer to log into the portal</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
