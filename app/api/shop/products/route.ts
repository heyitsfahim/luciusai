import { NextResponse } from 'next/server'
import { getShopDb } from '@/lib/shop-db'

export async function GET() {
  const db = getShopDb()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('domain')
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
