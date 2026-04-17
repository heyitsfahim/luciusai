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

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: 'rgba(245,194,0,0.1)',    text: '#F5C200', border: 'rgba(245,194,0,0.3)' },
  paid:      { bg: 'rgba(40,120,181,0.12)',   text: '#5BA3D9', border: 'rgba(40,120,181,0.3)' },
  cancelled: { bg: 'rgba(220,50,50,0.1)',     text: '#ff8080', border: 'rgba(220,50,50,0.25)' },
  refunded:  { bg: 'rgba(217,120,40,0.1)',    text: '#E89040', border: 'rgba(217,120,40,0.25)' },
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null } return r.json() })
      .then(data => { if (data) { setStats(data); setLoading(false) } })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3d3d3d' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#3d3d3d' }}>
      <AdminNav onLogout={handleLogout} current="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Overview of your business</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard title="Total Revenue" value={formatBDT(stats?.totalRevenue || 0)} icon="💰" accent="yellow" />
          <StatCard title="Total Customers" value={stats?.customers.total || 0} icon="👤" accent="blue" />
          <StatCard title="Active Products" value={stats?.activeProducts || 0} icon="📦" accent="orange" />
          <StatCard title="Paid Orders" value={stats?.orders.paid || 0} icon="✅" accent="blue" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Customer breakdown */}
          <div className="rounded-2xl p-6 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <h2 className="font-bold mb-5 flex items-center gap-2 text-white">
              <span>👥</span> Customer Status
            </h2>
            <div className="space-y-3">
              <StatusRow label="Active / Paid" value={stats?.customers.active || 0} color="#2878B5" />
              <StatusRow label="Inactive / Pending" value={stats?.customers.inactive || 0} color="#F5C200" />
              <StatusRow label="Disabled" value={stats?.customers.disabled || 0} color="#ff8080" />
              <div className="border-t border-white/10 pt-3">
                <StatusRow label="Total" value={stats?.customers.total || 0} color="white" bold />
              </div>
            </div>
            <Link href="/admin/customers" className="block mt-4 text-center text-xs transition-colors" style={{ color: '#F5C200' }}>
              Manage Customers →
            </Link>
          </div>

          {/* Orders breakdown */}
          <div className="rounded-2xl p-6 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <h2 className="font-bold mb-5 flex items-center gap-2 text-white">
              <span>📋</span> Order Status
            </h2>
            <div className="space-y-3">
              <StatusRow label="Pending Payment" value={stats?.orders.pending || 0} color="#F5C200" />
              <StatusRow label="Paid" value={stats?.orders.paid || 0} color="#2878B5" />
              <StatusRow label="Cancelled" value={stats?.orders.cancelled || 0} color="#ff8080" />
              <div className="border-t border-white/10 pt-3">
                <StatusRow label="Total Orders" value={stats?.orders.total || 0} color="white" bold />
              </div>
            </div>
            <Link href="/admin/orders" className="block mt-4 text-center text-xs transition-colors" style={{ color: '#F5C200' }}>
              Manage Orders →
            </Link>
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="font-bold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs transition-colors" style={{ color: '#F5C200' }}>View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left font-medium px-5 py-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders.map(order => {
                  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: '#F5C200' }}>{order.order_number}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-white">{order.customer_name}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.customer_email}</div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-white">{formatBDT(order.total_bdt)}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg border" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-BD')}
                      </td>
                    </tr>
                  )
                })}
                {!stats?.recentOrders.length && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, accent }: { title: string; value: string | number; icon: string; accent: string }) {
  const styles: Record<string, { bg: string; border: string }> = {
    yellow: { bg: 'rgba(245,194,0,0.08)',    border: 'rgba(245,194,0,0.25)' },
    blue:   { bg: 'rgba(40,120,181,0.1)',    border: 'rgba(40,120,181,0.25)' },
    orange: { bg: 'rgba(217,120,40,0.08)',   border: 'rgba(217,120,40,0.25)' },
  }
  const s = styles[accent] || styles.yellow
  return (
    <div className="rounded-2xl p-5 border" style={{ backgroundColor: s.bg, borderColor: s.border }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{title}</div>
    </div>
  )
}

function StatusRow({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm" style={{ color: bold ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

export function AdminNav({ onLogout, current }: { onLogout: () => void; current: string }) {
  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', key: 'dashboard', icon: '📊' },
    { href: '/admin/orders',    label: 'Orders',    key: 'orders',    icon: '📋' },
    { href: '/admin/customers', label: 'Customers', key: 'customers', icon: '👥' },
    { href: '/admin/products',  label: 'Products',  key: 'products',  icon: '📦' },
    { href: '/admin/content',   label: 'Content',   key: 'content',   icon: '🎬' },
  ]

  return (
    <header className="border-b border-white/10" style={{ backgroundColor: '#2e2e2e' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs" style={{ background: 'linear-gradient(135deg, #F5C200, #D97828)' }}>L</div>
              <span className="font-bold text-sm text-white">Admin</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={current === link.key
                    ? { backgroundColor: 'rgba(245,194,0,0.12)', color: '#F5C200' }
                    : { color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shop" target="_blank" className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
              View Shop ↗
            </Link>
            <button onClick={onLogout} className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
