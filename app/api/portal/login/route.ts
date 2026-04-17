import { NextRequest, NextResponse } from 'next/server'
import { getShopDb } from '@/lib/shop-db'
import { createHash, randomBytes } from 'crypto'

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(salt + password).digest('hex')
}

export async function POST(req: NextRequest) {
  const db = getShopDb()
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const { data: customer, error } = await db
    .from('shop_customers')
    .select('id, email, name, password_hash, status')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !customer) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  if (customer.status === 'disabled') {
    return NextResponse.json({ error: 'Account has been disabled. Contact support.' }, { status: 403 })
  }

  if (!customer.password_hash) {
    return NextResponse.json({ error: 'No password set. Please contact support to set up your account.' }, { status: 401 })
  }

  // password_hash stored as "salt:hash"
  const [salt, storedHash] = customer.password_hash.split(':')
  const inputHash = hashPassword(password, salt)

  if (inputHash !== storedHash) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  // Create a simple session token
  const token = Buffer.from(JSON.stringify({
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  })).toString('base64')

  const res = NextResponse.json({ success: true, name: customer.name })
  res.cookies.set('portal_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('portal_token')
  return res
}
