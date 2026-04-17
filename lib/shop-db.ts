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
  'Physical Book':           'bg-[#D97828]/15 text-[#E89040] border border-[#D97828]/30',
  'Video Course':            'bg-[#2878B5]/15 text-[#5BA3D9] border border-[#2878B5]/30',
  'PDF':                     'bg-[#2878B5]/10 text-[#5BA3D9] border border-[#2878B5]/25',
  'Digital File':            'bg-[#F5C200]/10 text-[#F5C200] border border-[#F5C200]/25',
  'In-Person or One-on-One': 'bg-[#D97828]/10 text-[#E89040] border border-[#D97828]/25',
}

export const ITEM_TYPE_ICONS: Record<string, string> = {
  'Physical Book': '📚',
  'Video Course': '🎬',
  'PDF': '📄',
  'Digital File': '💾',
  'In-Person or One-on-One': '🤝',
}
