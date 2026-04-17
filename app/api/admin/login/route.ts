import { NextRequest, NextResponse } from 'next/server'
import { getShopDb } from '@/lib/shop-db'
import { createHash } from 'crypto'

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(salt + password).digest('hex')
}

export async function POST(req: NextRequest) {
  const db = getShopDb()
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const { data: admin, error } = await db
    .from('admin_accounts')
    .select('id, email, name, password_hash, is_active')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !admin || !admin.is_active) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const [salt, storedHash] = admin.password_hash.split(':')
  const inputHash = hashPassword(password, salt)

  if (inputHash !== storedHash) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = Buffer.from(JSON.stringify({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: 'admin',
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  })).toString('base64')

  const res = NextResponse.json({ success: true, name: admin.name })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_token')
  return res
}
