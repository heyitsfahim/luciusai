import { NextRequest, NextResponse } from 'next/server'
import { getShopDb } from '@/lib/shop-db'

export async function POST(req: NextRequest) {
  const db = getShopDb()
  const body = await req.json()
  const { customer_name, customer_email, customer_phone, items, notes } = body

  if (!customer_name || !customer_email || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(customer_email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Fetch product prices from DB (never trust client-sent prices)
  const productIds = items.map((i: { product_id: string }) => i.product_id)
  const { data: products, error: prodError } = await db
    .from('products')
    .select('id, name, item_type, price_bdt, is_active, stock_count')
    .in('id', productIds)
    .eq('is_active', true)

  if (prodError || !products?.length) {
    return NextResponse.json({ error: 'Invalid products' }, { status: 400 })
  }

  const productMap = new Map(products.map(p => [p.id, p]))
  let total = 0
  const orderItems = []

  for (const item of items) {
    const product = productMap.get(item.product_id)
    if (!product) return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 })
    const qty = Math.max(1, parseInt(item.quantity) || 1)
    total += product.price_bdt * qty
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      item_type: product.item_type,
      price_bdt: product.price_bdt,
      quantity: qty,
    })
  }

  // Upsert customer
  let customerId: string
  const { data: existingCustomer } = await db
    .from('shop_customers')
    .select('id')
    .eq('email', customer_email.toLowerCase())
    .single()

  if (existingCustomer) {
    customerId = existingCustomer.id
    await db.from('shop_customers').update({
      name: customer_name,
      phone: customer_phone || null,
      updated_at: new Date().toISOString(),
    }).eq('id', customerId)
  } else {
    const { data: newCustomer, error: custError } = await db
      .from('shop_customers')
      .insert({ email: customer_email.toLowerCase(), name: customer_name, phone: customer_phone || null })
      .select('id')
      .single()
    if (custError) return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    customerId = newCustomer.id
  }

  // Create order
  const { data: order, error: orderError } = await db
    .from('shop_orders')
    .insert({
      order_number: '',
      customer_id: customerId,
      customer_name,
      customer_email: customer_email.toLowerCase(),
      customer_phone: customer_phone || null,
      total_bdt: total,
      notes: notes || null,
      status: 'pending',
    })
    .select('id, order_number')
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  // Create order items
  const { error: itemsError } = await db.from('shop_order_items').insert(
    orderItems.map(oi => ({ ...oi, order_id: order.id }))
  )

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  // Grant access for free items immediately
  const freeItems = orderItems.filter(oi => oi.price_bdt === 0)
  if (freeItems.length > 0) {
    const accessRows = freeItems.map(oi => ({
      customer_id: customerId,
      product_id: oi.product_id,
      order_id: order.id,
      is_active: true,
    }))
    await db.from('customer_access').upsert(accessRows, { onConflict: 'customer_id,product_id' })
  }

  return NextResponse.json({ order_number: order.order_number, order_id: order.id, total_bdt: total })
}
