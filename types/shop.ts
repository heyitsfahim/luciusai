export type ItemType =
  | 'Physical Book'
  | 'Video Course'
  | 'PDF'
  | 'Digital File'
  | 'In-Person or One-on-One'

export interface Product {
  id: string
  domain: string
  name: string
  item_type: ItemType
  price_bdt: number
  description: string | null
  thumbnail_url: string | null
  is_active: boolean
  is_free: boolean
  stock_count: number | null
  position: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  item_type: string
  price_bdt: number
  quantity: number
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  total_bdt: number
  payment_method: string | null
  payment_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface ShopCustomer {
  id: string
  email: string
  name: string
  phone: string | null
  status: 'active' | 'inactive' | 'disabled'
  email_verified: boolean
  created_at: string
}

export interface CourseModule {
  id: string
  product_id: string
  title: string
  position: number
  lessons?: CourseLesson[]
}

export interface CourseLesson {
  id: string
  module_id: string
  title: string
  video_url: string | null
  video_embed_url: string | null
  duration_minutes: number | null
  position: number
  is_preview: boolean
}

export interface DigitalAsset {
  id: string
  product_id: string
  name: string
  file_url: string
  file_type: string | null
  file_size_bytes: number | null
}
