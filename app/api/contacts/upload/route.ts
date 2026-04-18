export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { verifyEmail, classifyByVerification } from '@/lib/enrichment'
import type { UploadedContact } from '@/types'

interface ParsedRow {
  name?: string
  fund?: string
  company?: string
  email?: string
  linkedin?: string
  phone?: string
  [key: string]: string | undefined
}

function normalise(row: ParsedRow): UploadedContact {
  return {
    id: crypto.randomUUID(),
    user_id: '',
    name: row.name ?? row.Name ?? null,
    fund: row.fund ?? row.Fund ?? row.company ?? row.Company ?? null,
    email: row.email ?? row.Email ?? null,
    linkedin: row.linkedin ?? row.LinkedIn ?? row['LinkedIn URL'] ?? null,
    phone: row.phone ?? row.Phone ?? null,
    status: 'new',
    raw_data: row as Record<string, unknown>,
    created_at: new Date().toISOString(),
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const text = await file.text()
  let rows: ParsedRow[] = []

  // Parse CSV (simple — use PapaParse in real prod)
  const lines = text.split('\n').filter(Boolean)
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])) as ParsedRow
  })

  const service = createServiceClient()

  // Load decision_makers for fuzzy matching
  const { data: dms } = await service
    .from('decision_makers')
    .select('id, name, fund_id, email')

  const results: UploadedContact[] = []

  for (const row of rows.slice(0, 500)) {
    const contact = normalise(row)
    contact.user_id = user.id

    // Fuzzy match against known DMs
    const match = dms?.find(
      dm =>
        dm.name?.toLowerCase() === contact.name?.toLowerCase() ||
        (dm.email && dm.email === contact.email)
    )

    if (match) {
      contact.status = 'matched'
    } else if (contact.email) {
      const verification = await verifyEmail(contact.email)
      contact.status = classifyByVerification(verification)
    } else {
      contact.status = 'unverified'
    }

    results.push(contact)
  }

  // Upsert into DB
  await service.from('uploaded_contacts').insert(results)

  const summary = {
    total: results.length,
    matched: results.filter(r => r.status === 'matched').length,
    enriched: results.filter(r => r.status === 'enriched').length,
    new_contacts: results.filter(r => r.status === 'new').length,
    unverified: results.filter(r => r.status === 'unverified').length,
    contacts: results,
  }

  return NextResponse.json(summary)
}
