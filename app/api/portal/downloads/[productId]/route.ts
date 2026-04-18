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

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const session = getCustomerFromToken(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { productId } = params

  // Verify access
  const { data: access } = await db
    .from('customer_access')
    .select('id')
    .eq('customer_id', session.customerId)
    .eq('product_id', productId)
    .eq('is_active', true)
    .single()

  const { data: product } = await db
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (!access && product?.price_bdt !== 0) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { data: assets } = await db
    .from('digital_assets')
    .select('*')
    .eq('product_id', productId)

  return NextResponse.json({ product, assets: assets || [] })
}
