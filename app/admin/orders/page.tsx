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

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  paid: 'bg-green-400/10 text-green-400 border border-green-400/20',
  cancelled: 'bg-red-400/10 text-red-400 border border-red-400/20',
  refunded: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
}

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminNav onLogout={handleLogout} current="orders" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">Orders</h1>
            <p className="text-white/40 text-sm mt-1">Manage customer orders and payments</p>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <input
              type="text"
              placeholder="Search orders..."
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
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
                    <th className="text-left text-white/40 font-medium px-5 py-3">Order</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Customer</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Items</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Amount</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Status</th>
                    <th className="text-left text-white/40 font-medium px-5 py-3">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 font-mono text-amber-400 text-xs">{order.order_number}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-white/40 text-xs">{order.customer_email}</div>
                        {order.customer_phone && <div className="text-white/40 text-xs">{order.customer_phone}</div>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="space-y-0.5">
                          {order.shop_order_items.map((item, i) => (
                            <div key={i} className="text-xs text-white/60 line-clamp-1">{item.product_name}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-amber-400">{formatBDT(order.total_bdt)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[order.status] || ''}`}>
                          {order.status}
                        </span>
                        {order.payment_reference && (
                          <div className="text-xs text-white/30 mt-1">Ref: {order.payment_reference}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-white/40 text-xs">{new Date(order.created_at).toLocaleDateString('en-BD')}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => { setSelected(order); setUpdateForm({ status: order.status, payment_method: order.payment_method || '', payment_reference: order.payment_reference || '' }) }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!orders.length && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30">No orders found</td></tr>
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
          <div className="bg-[#111] border border-white/15 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold mb-1">Update Order</h3>
            <p className="text-white/40 text-sm mb-5 font-mono">{selected.order_number}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Status</label>
                <select
                  value={updateForm.status}
                  onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                {updateForm.status === 'paid' && (
                  <p className="text-green-400 text-xs mt-1.5">✓ Marking as paid will grant the customer access to digital products</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Payment Method</label>
                <select
                  value={updateForm.payment_method}
                  onChange={e => setUpdateForm(f => ({ ...f, payment_method: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="">Select method</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Payment Reference</label>
                <input
                  type="text"
                  value={updateForm.payment_reference}
                  onChange={e => setUpdateForm(f => ({ ...f, payment_reference: e.target.value }))}
                  placeholder="Transaction ID"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
