import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { sendGmailMessage, refreshAccessToken } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, body, dm_id } = await req.json()
  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing to/subject/body' }, { status: 400 })
  }

  const service = createServiceClient()

  // Get stored tokens
  const { data: tokenRow } = await service
    .from('gmail_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tokenRow) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
  }

  let accessToken = tokenRow.access_token

  // Refresh if expired
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    const refreshed = await refreshAccessToken(tokenRow.refresh_token!)
    accessToken = refreshed.access_token
    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
    await service
      .from('gmail_tokens')
      .update({ access_token: accessToken, expires_at: expiresAt, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  await sendGmailMessage(accessToken!, { to, subject, body })

  // Log to outreach_history
  await service.from('outreach_history').insert({
    user_id: user.id,
    dm_id: dm_id ?? null,
    channel: 'email',
    direction: 'out',
    subject,
    body,
    sent_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
