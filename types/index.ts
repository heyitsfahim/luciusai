// Flowstate IR — Core TypeScript Types

export type FundCategory = 'supply-chain' | 'warehousing' | 'ecommerce'
export type FundStage = 'pre-seed' | 'seed' | 'post-seed' | 'series-a' | 'early' | 'growth' | 'late'
export type ContactStatus = 'tracked' | 'outreached' | 'replied' | 'meeting'
export type TaskChannel = 'email' | 'linkedin' | 'whatsapp'
export type TaskType = 'inbound' | 'followup'
export type TaskPriority = 'urgent' | 'high' | 'normal'
export type NotificationType = 'fundraise' | 'reply' | 'followup' | 'signal'
export type OutreachDirection = 'in' | 'out'
export type UploadStatus = 'matched' | 'enriched' | 'new' | 'unverified'

export interface User {
  id: string
  email: string
  name: string | null
  company_name: string | null
  company_stage: string | null
  raise_target: number | null
  raise_committed: number | null
  calendly_url: string | null
  avatar_url: string | null
  dark_mode: boolean
  created_at: string
}

export interface Fund {
  id: string
  name: string
  hq: string | null
  check_min: number | null
  check_max: number | null
  aum: string | null
  category: FundCategory
  stages: FundStage[]
  about: string | null
  color: string
  color_bg: string
  portfolio: string[]
  website: string | null
  activity_status: 'hot' | 'warm' | null
  activity_note: string | null
  created_at: string
  // joined
  decision_makers?: DecisionMaker[]
}

export interface DecisionMaker {
  id: string
  fund_id: string
  name: string
  role: string | null
  email: string | null
  linkedin: string | null
  bio: string | null
  initials: string
  avatar_color: string
  // joined
  fund?: Fund
  contact?: Contact
}

export interface Contact {
  id: string
  user_id: string
  dm_id: string
  status: ContactStatus
  relationship_score: number
  notes: string | null
  last_contacted_at: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  channel: TaskChannel
  type: TaskType
  priority: TaskPriority
  title: string
  preview: string | null
  ai_draft: string | null
  contact_name: string | null
  contact_fund: string | null
  due_date: string | null
  done: boolean
  is_new: boolean
  created_at: string
}

export interface OutreachHistory {
  id: string
  user_id: string
  dm_id: string | null
  channel: TaskChannel
  direction: OutreachDirection
  subject: string | null
  body: string | null
  sent_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string | null
  data: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface UploadedContact {
  id: string
  user_id: string
  name: string | null
  fund: string | null
  email: string | null
  linkedin: string | null
  phone: string | null
  status: UploadStatus
  raw_data: Record<string, unknown>
  created_at: string
}

// ─── AI Drafting ───────────────────────────────────────────────────────────

export interface DraftIntroInput {
  dm: DecisionMaker
  fund: Fund
  user: User
}

export interface DraftIntroOutput {
  subject: string
  body: string
}

export interface DraftReplyInput {
  inbound_message: string
  dm: DecisionMaker
  user: User
  history: OutreachHistory[]
}

export interface DraftFollowupInput {
  original_email: string
  dm: DecisionMaker
  followup_number: 1 | 2
  user: User
}

// ─── Feed ──────────────────────────────────────────────────────────────────

export interface FeedArticle {
  id: string
  title: string
  source: string
  source_logo?: string
  published_at: string
  summary: string
  url: string
  category: string
  investors_mentioned?: {
    dm: DecisionMaker
    fund: Fund
  }[]
  thumbnail_svg?: string
}

// ─── Upload Flow ───────────────────────────────────────────────────────────

export interface UploadResult {
  total: number
  matched: number
  enriched: number
  new_contacts: number
  unverified: number
  contacts: UploadedContact[]
}

// ─── Supabase DB Type (auto-generated shape) ───────────────────────────────

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> }
      funds: { Row: Fund; Insert: Partial<Fund>; Update: Partial<Fund> }
      decision_makers: { Row: DecisionMaker; Insert: Partial<DecisionMaker>; Update: Partial<DecisionMaker> }
      contacts: { Row: Contact; Insert: Partial<Contact>; Update: Partial<Contact> }
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> }
      outreach_history: { Row: OutreachHistory; Insert: Partial<OutreachHistory>; Update: Partial<OutreachHistory> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
      uploaded_contacts: { Row: UploadedContact; Insert: Partial<UploadedContact>; Update: Partial<UploadedContact> }
    }
  }
}
