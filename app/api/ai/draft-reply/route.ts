export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/anthropic'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { DraftReplyInput, DraftIntroOutput } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as DraftReplyInput
  const { inbound_message, dm, user: profile, history } = body

  if (!inbound_message || !dm || !profile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const founderName = profile.name ?? 'the founder'
  const companyName = profile.company_name ?? 'our company'

  const historyText = history?.length
    ? history
        .slice(-3)
        .map(h => `[${h.direction === 'out' ? 'You' : dm.name}]: ${h.body}`)
        .join('\n\n')
    : 'No prior history.'

  const systemPrompt = `You are helping ${founderName} (${companyName}) reply to an investor email from ${dm.name} at ${dm.role ?? 'their fund'}.

Match the investor's tone. Be concise and specific. Move the conversation forward — toward a meeting or next step.`

  const userPrompt = `Previous exchange:
${historyText}

Investor's latest message:
"${inbound_message}"

Write a reply from ${founderName}. Return JSON with "subject" and "body" fields. Keep body under 150 words.`

  try {
    const raw = await generateText(systemPrompt, userPrompt, 400)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0]) as DraftIntroOutput
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[draft-reply] error:', err)
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })
  }
}
