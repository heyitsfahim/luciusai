// Contact enrichment via Hunter.io

export interface HunterVerifyResult {
  result: 'deliverable' | 'undeliverable' | 'risky' | 'unknown'
  score: number
  regexp: boolean
  gibberish: boolean
  disposable: boolean
  webmail: boolean
  mx_records: boolean
  smtp_server: boolean
  smtp_check: boolean
  accept_all: boolean
  block: boolean
  sources: { domain: string; uri: string; extracted_on: string }[]
}

export async function verifyEmail(email: string): Promise<HunterVerifyResult | null> {
  const apiKey = process.env.HUNTER_API_KEY
  if (!apiKey) return null

  const res = await fetch(
    `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`
  )
  if (!res.ok) return null

  const data = await res.json()
  return data.data as HunterVerifyResult
}

export function classifyByVerification(result: HunterVerifyResult | null): 'matched' | 'enriched' | 'new' | 'unverified' {
  if (!result) return 'unverified'
  if (result.result === 'deliverable' && result.score >= 80) return 'matched'
  if (result.result === 'deliverable') return 'enriched'
  if (result.result === 'risky') return 'new'
  return 'unverified'
}
