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

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = getCustomerFromToken(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { courseId } = params

  // Verify access
  const { data: access } = await db
    .from('customer_access')
    .select('id')
    .eq('customer_id', session.customerId)
    .eq('product_id', courseId)
    .eq('is_active', true)
    .single()

  const { data: product } = await db
    .from('products')
    .select('id, price_bdt')
    .eq('id', courseId)
    .single()

  // Allow access if product is free or customer has explicit access
  if (!access && product?.price_bdt !== 0) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Get course modules and lessons
  const { data: modules } = await db
    .from('course_modules')
    .select(`id, title, position, course_lessons(id, title, video_url, video_embed_url, duration_minutes, position, is_preview)`)
    .eq('product_id', courseId)
    .order('position')

  // Get progress
  const lessonIds = (modules || []).flatMap(m =>
    (m.course_lessons || []).map((l: { id: string }) => l.id)
  )

  const { data: progress } = await db
    .from('course_progress')
    .select('lesson_id, completed')
    .eq('customer_id', session.customerId)
    .in('lesson_id', lessonIds)

  return NextResponse.json({ modules: modules || [], progress: progress || [] })
}
