'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatBDT } from '@/lib/shop-db'

interface Stats {
  customers: { active: number; inactive: number; disabled: number; total: number }
  orders: { pending: number; paid: number; cancelled: number; total: number }
  totalRevenue: number
  activeProducts: number
  recentOrders: Array<{
    id: string; order_number: string; customer_name: string; customer_email: string
    total_bdt: number; status: string; created_at: string
  }>
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  paid: 'bg-green-400/10 text-green-400 border border-green-400/20',
  cancelled: 'bg-red-400/10 text-red-400 border border-red-400/20',
  refunded: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => {
        if (r.status === 401) { router.push('/admin/login'); return null }
        return r.json()
      })
      .then(data => { if (data) { setStats(data); setLoading(false) } })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminNav onLogout={handleLogout} current="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Overview of your business</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard title="Total Revenue" value={formatBDT(stats?.totalRevenue || 0)} icon="💰" accent="amber" />
          <StatCard title="Total Customers" value={stats?.customers.total || 0} icon="👤" accent="blue" />
          <StatCard title="Active Products" value={stats?.activeProducts || 0} icon="📦" accent="purple" />
          <StatCard title="Paid Orders" value={stats?.orders.paid || 0} icon="✅" accent="green" />
        </div>

        {/* Customer breakdown */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold mb-5 flex items-center gap-2">
              <span>👥</span> Customer Status
            </h2>
            <div className="space-y-3">
              <StatusRow label="Active / Paid" value={stats?.customers.active || 0} color="text-green-400" />
              <StatusRow label="Inactive / Pending" value={stats?.customers.inactive || 0} color="text-yellow-400" />
              <StatusRow label="Disabled" value={stats?.customers.disabled || 0} color="text-red-400" />
              <div className="border-t border-white/10 pt-3">
                <StatusRow label="Total" value={stats?.customers.total || 0} color="text-white" bold />
              </div>
            </div>
            <Link href="/admin/customers" className="block mt-4 text-center text-amber-400 text-xs hover:text-amber-300 transition-colors">
              Manage Customers →
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold mb-5 flex items-center gap-2">
              <span>📋</span> Order Status
            </h2>
            <div className="space-y-3">
              <StatusRow label="Pending Payment" value={stats?.orders.pending || 0} color="text-yellow-400" />
              <StatusRow label="Paid" value={stats?.orders.paid || 0} color="text-green-400" />
              <StatusRow label="Cancelled" value={stats?.orders.cancelled || 0} color="text-red-400" />
              <div className="border-t border-white/10 pt-3">
                <StatusRow label="Total Orders" value={stats?.orders.total || 0} color="text-white" bold />
              </div>
            </div>
            <Link href="/admin/orders" className="block mt-4 text-center text-amber-400 text-xs hover:text-amber-300 transition-colors">
              Manage Orders →
            </Link>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-amber-400 text-xs hover:text-amber-300 transition-colors">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/40 font-medium px-5 py-3">Order</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3">Customer</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3">Amount</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 font-mono text-amber-400 text-xs">{order.order_number}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-white/40 text-xs">{order.customer_email}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatBDT(order.total_bdt)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/40 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-BD')}
                    </td>
                  </tr>
                ))}
                {!stats?.recentOrders.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-white/30">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, accent }: {
  title: string; value: string | number; icon: string; accent: string
}) {
  const accentColors: Record<string, string> = {
    amber: 'bg-amber-400/10 border-amber-400/20',
    blue: 'bg-blue-400/10 border-blue-400/20',
    purple: 'bg-purple-400/10 border-purple-400/20',
    green: 'bg-green-400/10 border-green-400/20',
  }
  return (
    <div className={`${accentColors[accent]} border rounded-2xl p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-white/50 text-xs mt-1">{title}</div>
    </div>
  )
}

function StatusRow({ label, value, color, bold }: {
  label: string; value: number; color: string; bold?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'text-white font-semibold' : 'text-white/60'}`}>{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  )
}

export function AdminNav({ onLogout, current }: { onLogout: () => void; current: string }) {
  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', key: 'dashboard', icon: '📊' },
    { href: '/admin/orders', label: 'Orders', key: 'orders', icon: '📋' },
    { href: '/admin/customers', label: 'Customers', key: 'customers', icon: '👥' },
    { href: '/admin/products', label: 'Products', key: 'products', icon: '📦' },
    { href: '/admin/content', label: 'Content', key: 'content', icon: '🎬' },
  ]

  return (
    <header className="bg-[#111] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-xs">L</div>
              <span className="font-bold text-sm">Admin</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    current === link.key
                      ? 'bg-amber-400/10 text-amber-400'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shop" target="_blank" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              View Shop ↗
            </Link>
            <button
              onClick={onLogout}
              className="text-xs text-white/40 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
