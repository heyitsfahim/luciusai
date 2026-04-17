/**
 * Run this script to create the first admin account:
 *   npx tsx scripts/create-admin.ts
 *
 * Set environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'
import * as readline from 'readline'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(salt + password).digest('hex')
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans) }))
}

async function main() {
  const email = await prompt('Admin email: ')
  const name = await prompt('Admin name: ')
  const password = await prompt('Admin password: ')

  const salt = randomBytes(16).toString('hex')
  const hash = hashPassword(password, salt)
  const password_hash = `${salt}:${hash}`

  const { data, error } = await db
    .from('admin_accounts')
    .insert({ email: email.toLowerCase(), name, password_hash })
    .select('id, email, name')
    .single()

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('\n✅ Admin account created:')
  console.log(`  ID:    ${data.id}`)
  console.log(`  Email: ${data.email}`)
  console.log(`  Name:  ${data.name}`)
  console.log('\nYou can now login at /admin/login')
}

main().catch(console.error)
