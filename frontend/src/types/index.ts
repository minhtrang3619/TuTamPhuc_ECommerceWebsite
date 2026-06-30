// ========================
// Auth Types
// ========================
export type UserRole = 'guest' | 'customer' | 'admin' | 'staff' | 'shop_staff' | 'customer_service'

export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  avatar?: string
  role: UserRole
  is_active: boolean
  customer?: {
    id: number
    full_name: string
    email: string
    phone?: string
    address?: string
    avatar?: string
    is_active?: boolean
  }
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

// ========================
// Product Types
// ========================
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: number
  children?: Category[]
  product_count?: number
  created_at: string
}

export interface ProductImage {
  id: number
  url: string
  alt?: string
  is_primary: boolean
}

export interface ProductVariant {
  id: number
  name: string        // e.g., "Màu", "Size"
  value: string       // e.g., "Vàng", "M"
  additional_price: number
  stock: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  sale_price?: number
  sku?: string
  stock: number
  status: ProductStatus
  category_id: number
  category: Category
  images: ProductImage[]
  variants?: ProductVariant[]
  tags?: string[]
  weight?: number
  video_url?: string
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

// ========================
// Cart Types
// ========================
export interface CartItem {
  id: number
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  subtotal: number
}

export interface Cart {
  id: number
  items: CartItem[]
  total_items: number
  subtotal: number
  discount: number
  shipping_fee: number
  total: number
}

// ========================
// Order Types
// ========================
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cod' | 'bank_transfer' | 'vnpay' | 'momo'

export interface ShippingAddress {
  full_name: string
  phone: string
  address: string
  ward: string
  district: string
  province: string
  charity_message?: string
  is_charity_anonymous?: boolean
}

export interface OrderItem {
  id: number
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  order_code: string
  user: User
  items: OrderItem[]
  shipping_address: ShippingAddress
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  subtotal: number
  discount: number
  shipping_fee: number
  total: number
  notes?: string
  created_at: string
  updated_at: string
  return_request?: ReturnRequest
}

// ========================
// Return & Refund Types
// ========================
export type ReturnRequestStatus = 'pending' | 'approved' | 'rejected'

export interface ReturnRequest {
  id: number
  order_id: number
  reason: string
  description?: string
  images: string[]
  shipping_method: string
  bank_name: string
  account_number: string
  account_holder: string
  status: ReturnRequestStatus
  created_at: string
  updated_at: string
}

export interface ReturnRequestCreate {
  reason: string
  description?: string
  images: string[]
  shipping_method: string
  bank_name: string
  account_number: string
  account_holder: string
}


// ========================
// Review Types
// ========================
export interface Review {
  id: number
  product_id: number
  user: Pick<User, 'id' | 'full_name' | 'avatar'>
  rating: number
  title?: string
  content?: string
  images?: string[]
  is_verified_purchase: boolean
  created_at: string
}

// ========================
// Wishlist Types
// ========================
export interface WishlistItem {
  id: number
  product: Product
  created_at: string
}

// ========================
// Blog Types
// ========================
export type BlogStatus = 'draft' | 'published'

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  content: string
  thumbnail?: string
  author: Pick<User, 'id' | 'full_name' | 'avatar'>
  status: BlogStatus
  tags?: string[]
  view_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

// ========================
// API Response Types
// ========================
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  detail: string
  status_code?: number
}

// ========================
// Filter & Query Types
// ========================
export interface ProductFilters {
  category_id?: number
  min_price?: number
  max_price?: number
  status?: ProductStatus
  search?: string
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
  page?: number
  page_size?: number
}

// ========================
// Chat Types
// ========================
export interface ChatMessage {
  sender: 'user' | 'assistant'
  text: string
  timestamp: Date
}

// ========================
// Customer Types
// ========================
export interface Customer {
  id: number
  full_name: string
  email: string
  phone?: string
  address?: string
  avatar?: string
  tier: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ========================
// User Address Types
// ========================
export interface UserAddress {
  id: number
  user_id: number
  name: string
  phone: string
  province: string
  district: string
  ward: string
  street: string
  isDefault: boolean
  created_at: string
  updated_at: string
}

// ========================
// Support Ticket Types
// ========================
export interface SupportTicket {
  id: number
  ticket_code: string
  user_id: number
  user?: Pick<User, 'id' | 'full_name' | 'avatar'>
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'solving' | 'closed'
  created_at: string
  updated_at: string
}


