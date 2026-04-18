export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/anthropic'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { DraftFollowupInput, DraftIntroOutput } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as DraftFollowupInput
  const { original_email, dm, followup_number, user: profile } = body

  if (!original_email || !dm || !profile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const founderName = profile.name ?? 'the founder'
  const companyName = profile.company_name ?? 'our company'

  const isFirst = followup_number === 1
  const daysSince = isFirst ? 5 : 10

  const systemPrompt = `You are helping ${founderName} (${companyName}) write a follow-up email to ${dm.name} who hasn't replied after ${daysSince} days.

Follow-up #${followup_number} guidelines:
${isFirst
  ? '- Brief (under 80 words)\n- Add a new hook (recent traction, news, or metric)\n- Soft tone — assume they are just busy\n- Clear one-line ask'
  : '- Very brief (under 60 words)\n- Final outreach — graceful, no desperation\n- Leave the door open for the future\n- No hard pitch'
}`

  const userPrompt = `Original email sent to ${dm.name}:
"${original_email.slice(0, 800)}"

Write follow-up #${followup_number}. Return JSON with "subject" (use "Re: " prefix) and "body".`

  try {
    const raw = await generateText(systemPrompt, userPrompt, 300)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0]) as DraftIntroOutput
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[draft-followup] error:', err)
    return NextResponse.json({ error: 'Failed to generate follow-up' }, { status: 500 })
  }
}
