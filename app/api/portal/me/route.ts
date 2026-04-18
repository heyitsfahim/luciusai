export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getShopDb } from '@/lib/shop-db'

function getCustomerFromToken(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value
  if (!token) return null
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString())
    if (data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const session = getCustomerFromToken(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()

  // Get customer's accessible products
  const { data: access } = await db
    .from('customer_access')
    .select('product_id, products(id, name, item_type, domain)')
    .eq('customer_id', session.customerId)
    .eq('is_active', true)

  return NextResponse.json({
    customer: { id: session.customerId, email: session.email, name: session.name },
    access: access || [],
  })
}
