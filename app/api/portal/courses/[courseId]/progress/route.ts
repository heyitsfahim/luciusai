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

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = getCustomerFromToken(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getShopDb()
  const { lessonId, completed } = await req.json()

  await db.from('course_progress').upsert(
    { customer_id: session.customerId, lesson_id: lessonId, completed, completed_at: completed ? new Date().toISOString() : null },
    { onConflict: 'customer_id,lesson_id' }
  )

  return NextResponse.json({ success: true })
}
