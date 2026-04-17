'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNav } from '../dashboard/page'
import { formatBDT } from '@/lib/shop-db'

interface OrderItem { product_name: string; item_type: string; price_bdt: number; quantity: number }
interface Order {
  id: string; order_number: string; customer_name: string; customer_email: string
  customer_phone: string | null; status: string; total_bdt: number
  payment_method: string | null; payment_reference: string | null
  notes: string | null; created_at: string
  shop_order_items: OrderItem[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: 'rgba(245,194,0,0.1)',    text: '#F5C200', border: 'rgba(245,194,0,0.3)' },
  paid:      { bg: 'rgba(40,120,181,0.12)',   text: '#5BA3D9', border: 'rgba(40,120,181,0.3)' },
  cancelled: { bg: 'rgba(220,50,50,0.1)',     text: '#ff8080', border: 'rgba(220,50,50,0.25)' },
  refunded:  { bg: 'rgba(217,120,40,0.1)',    text: '#E89040', border: 'rgba(217,120,40,0.25)' },
}

const inputClass = "border rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
const inputStyle = { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateForm, setUpdateForm] = useState({ status: '', payment_method: '', payment_reference: '' })

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/orders?${params}`)
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setOrders(data.orders || [])
    setLoading(false)
  }, [router, statusFilter, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleUpdate = async () => {
    if (!selected) return
    setUpdating(true)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: selected.id, ...updateForm }),
    })
    setUpdating(false)
    setSelected(null)
    fetchOrders()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      <AdminNav onLogout={handleLogout} current="orders" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Orders</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Manage customer orders and payments</p>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className={`${inputClass} w-52`} style={inputStyle} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
                    {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Date', ''].map((h, i) => (
                      <th key={i} className="text-left font-medium px-5 py-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
                    return (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs" style={{ color: '#F5C200' }}>{order.order_number}</td>
                        <td className="px-5 py-3">
                          <div className="font-medium text-white">{order.customer_name}</div>
                          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.customer_email}</div>
                          {order.customer_phone && <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.customer_phone}</div>}
                        </td>
                        <td className="px-5 py-3">
                          {order.shop_order_items.map((item, i) => (
                            <div key={i} className="text-xs line-clamp-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.product_name}</div>
                          ))}
                        </td>
                        <td className="px-5 py-3 font-semibold" style={{ color: '#F5C200' }}>{formatBDT(order.total_bdt)}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg border" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                            {order.status}
                          </span>
                          {order.payment_reference && <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Ref: {order.payment_reference}</div>}
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(order.created_at).toLocaleDateString('en-BD')}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => { setSelected(order); setUpdateForm({ status: order.status, payment_method: order.payment_method || '', payment_reference: order.payment_reference || '' }) }}
                            className="text-xs font-semibold transition-colors" style={{ color: '#F5C200' }}>Edit</button>
                        </td>
                      </tr>
                    )
                  })}
                  {!orders.length && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Update Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="rounded-2xl p-6 w-full max-w-md border border-white/15" style={{ backgroundColor: '#2e2e2e' }}>
            <h3 className="font-bold mb-1 text-white">Update Order</h3>
            <p className="text-sm mb-5 font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{selected.order_number}</p>
            <div className="space-y-4">
              <ModalField label="Status">
                <select value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none border" style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                {updateForm.status === 'paid' && (
                  <p className="text-xs mt-1.5" style={{ color: '#5BA3D9' }}>✓ Marking as paid will grant the customer access to digital products</p>
                )}
              </ModalField>
              <ModalField label="Payment Method">
                <select value={updateForm.payment_method} onChange={e => setUpdateForm(f => ({ ...f, payment_method: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none border" style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <option value="">Select method</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </ModalField>
              <ModalField label="Payment Reference">
                <input type="text" value={updateForm.payment_reference} onChange={e => setUpdateForm(f => ({ ...f, payment_reference: e.target.value }))} placeholder="Transaction ID" className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none border" style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }} />
              </ModalField>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)} className="flex-1 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-white/10 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>Cancel</button>
              <button onClick={handleUpdate} disabled={updating} className="flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50" style={{ backgroundColor: '#F5C200', color: '#333333' }}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
      {children}
    </div>
  )
}
