import { createClient } from '@supabase/supabase-js'

export function getShopDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export function formatBDT(amount: number): string {
  if (amount === 0) return 'FREE'
  return `৳${amount.toLocaleString('en-BD')}`
}

export const DOMAIN_ORDER = [
  'Startups & Venture Capital',
  'E-Commerce',
  'Communication',
  'Business',
  'One-on-One Business Coaching',
  'Personal Finance',
  'Business Finance',
]

export const ITEM_TYPE_COLORS: Record<string, string> = {
  'Physical Book': 'bg-amber-100 text-amber-800',
  'Video Course': 'bg-purple-100 text-purple-800',
  'PDF': 'bg-blue-100 text-blue-800',
  'Digital File': 'bg-teal-100 text-teal-800',
  'In-Person or One-on-One': 'bg-rose-100 text-rose-800',
}

export const ITEM_TYPE_ICONS: Record<string, string> = {
  'Physical Book': '📚',
  'Video Course': '🎬',
  'PDF': '📄',
  'Digital File': '💾',
  'In-Person or One-on-One': '🤝',
}
