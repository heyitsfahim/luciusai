export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getShopDb } from '@/lib/shop-db'

function getAdminFromToken(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString())
    if (data.exp < Date.now() || data.role !== 'admin') return null
    return data
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()

  const [customers, orders, products, recentOrders] = await Promise.all([
    db.from('shop_customers').select('id, status', { count: 'exact' }),
    db.from('shop_orders').select('id, status, total_bdt, created_at', { count: 'exact' }),
    db.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    db.from('shop_orders')
      .select('id, order_number, customer_name, customer_email, total_bdt, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const customersByStatus = {
    active: customers.data?.filter(c => c.status === 'active').length || 0,
    inactive: customers.data?.filter(c => c.status === 'inactive').length || 0,
    disabled: customers.data?.filter(c => c.status === 'disabled').length || 0,
    total: customers.count || 0,
  }

  const ordersByStatus = {
    pending: orders.data?.filter(o => o.status === 'pending').length || 0,
    paid: orders.data?.filter(o => o.status === 'paid').length || 0,
    cancelled: orders.data?.filter(o => o.status === 'cancelled').length || 0,
    total: orders.count || 0,
  }

  const totalRevenue = orders.data
    ?.filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.total_bdt, 0) || 0

  return NextResponse.json({
    customers: customersByStatus,
    orders: ordersByStatus,
    totalRevenue,
    activeProducts: products.count || 0,
    recentOrders: recentOrders.data || [],
  })
}
