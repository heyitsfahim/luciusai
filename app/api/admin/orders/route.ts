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
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  let query = db
    .from('shop_orders')
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      status, total_bdt, payment_method, payment_reference, notes, created_at,
      shop_order_items(product_name, item_type, price_bdt, quantity)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)
  if (search) query = query.or(`customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,order_number.ilike.%${search}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ orders: data, total: count, page, limit })
}

export async function PATCH(req: NextRequest) {
  const admin = getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { orderId, status, payment_method, payment_reference } = await req.json()

  const { data: order, error } = await db
    .from('shop_orders')
    .update({ status, payment_method, payment_reference, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('id, customer_id, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If marking as paid, grant access to all purchased products
  if (status === 'paid' && order.customer_id) {
    const { data: items } = await db
      .from('shop_order_items')
      .select('product_id')
      .eq('order_id', orderId)

    if (items?.length) {
      const accessRows = items.map(item => ({
        customer_id: order.customer_id,
        product_id: item.product_id,
        order_id: orderId,
        is_active: true,
      }))
      await db.from('customer_access').upsert(accessRows, { onConflict: 'customer_id,product_id' })

      // Activate customer if inactive
      await db.from('shop_customers')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', order.customer_id)
        .eq('status', 'inactive')
    }
  }

  return NextResponse.json({ success: true })
}
