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
    .from('shop_customers')
    .select('id, email, name, phone, status, email_verified, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)
  if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ customers: data, total: count, page, limit })
}

export async function PATCH(req: NextRequest) {
  const admin = getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { customerId, status, password } = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) updates.status = status

  if (password) {
    const { createHash, randomBytes } = await import('crypto')
    const salt = randomBytes(16).toString('hex')
    const hash = createHash('sha256').update(salt + password).digest('hex')
    updates.password_hash = `${salt}:${hash}`
  }

  const { error } = await db.from('shop_customers').update(updates).eq('id', customerId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
