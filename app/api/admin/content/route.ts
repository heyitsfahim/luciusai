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

// GET modules + lessons for a product
export async function GET(req: NextRequest) {
  const admin = getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')

  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const [modules, assets] = await Promise.all([
    db.from('course_modules')
      .select('id, title, position, course_lessons(id, title, video_url, video_embed_url, duration_minutes, position, is_preview)')
      .eq('product_id', productId)
      .order('position'),
    db.from('digital_assets')
      .select('*')
      .eq('product_id', productId),
  ])

  return NextResponse.json({
    modules: modules.data || [],
    assets: assets.data || [],
  })
}

// POST - add module or lesson
export async function POST(req: NextRequest) {
  const admin = getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const body = await req.json()
  const { type, ...data } = body

  if (type === 'module') {
    const { data: module, error } = await db
      .from('course_modules')
      .insert(data)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(module)
  }

  if (type === 'lesson') {
    const { data: lesson, error } = await db
      .from('course_lessons')
      .insert(data)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(lesson)
  }

  if (type === 'asset') {
    const { data: asset, error } = await db
      .from('digital_assets')
      .insert(data)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(asset)
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

// PATCH - update module, lesson, or asset
export async function PATCH(req: NextRequest) {
  const admin = getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { type, id, ...updates } = await req.json()

  const tableMap: Record<string, string> = {
    module: 'course_modules',
    lesson: 'course_lessons',
    asset: 'digital_assets',
  }

  const table = tableMap[type]
  if (!table) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  const { data, error } = await db.from(table).update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE - remove module, lesson, or asset
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { type, id } = await req.json()

  const tableMap: Record<string, string> = {
    module: 'course_modules',
    lesson: 'course_lessons',
    asset: 'digital_assets',
  }

  const table = tableMap[type]
  if (!table) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  const { error } = await db.from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
