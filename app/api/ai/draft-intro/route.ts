export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/anthropic'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { DraftIntroInput, DraftIntroOutput } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as DraftIntroInput
  const { dm, fund, user: profile } = body

  if (!dm || !fund || !profile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const companyName = profile.company_name ?? 'our company'
  const founderName = profile.name ?? 'the founder'
  const stage = profile.company_stage ?? 'seed'
  const raiseTarget = profile.raise_target ? `$${(profile.raise_target / 1000000).toFixed(1)}M` : 'seed round'
  const committed = profile.raise_committed
    ? `We have $${(profile.raise_committed / 1000).toFixed(0)}K committed.`
    : ''

  const systemPrompt = `You are an expert investor relations writer crafting cold intro emails for ${founderName}, co-founder of ${companyName} — a ${stage}-stage startup.

Write in a direct, confident, founder tone. Be concise (under 200 words). Always:
1. Reference the fund's specific investment thesis
2. Name-drop a relevant portfolio company
3. Include one specific metric about the company
4. End with a clear, low-friction ask (15-min call)

Never use fluff phrases like "I hope this finds you well" or "I am reaching out because". Start strong.`

  const userPrompt = `Write a cold intro email from ${founderName} to ${dm.name} (${dm.role} at ${fund.name}).

Fund context:
- Thesis: ${fund.about}
- Portfolio: ${fund.portfolio.slice(0, 3).join(', ')}
- Stage focus: ${fund.stages.join(', ')}
- Check size: $${((fund.check_min ?? 0) / 1000).toFixed(0)}K–$${((fund.check_max ?? 0) / 1000000).toFixed(1)}M

Founder context:
- Company: ${companyName} (${stage})
- Raise: ${raiseTarget} ${committed}
- Calendly: ${profile.calendly_url ?? '[calendly link]'}

Return a JSON object with exactly two fields: "subject" (string) and "body" (string). Do not include markdown formatting in the body.`

  try {
    const raw = await generateText(systemPrompt, userPrompt, 512)

    // Extract JSON from Claude's response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0]) as DraftIntroOutput

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[draft-intro] error:', err)
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}
