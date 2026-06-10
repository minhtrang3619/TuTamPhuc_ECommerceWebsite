import apiClient from './apiClient'
import type { Order, ShippingAddress, PaymentMethod, PaginatedResponse } from '@/types'

export interface CreateOrderItemData {
  product_id: number
  quantity: number
  color_name?: string
  color_hex?: string
  size?: string
  price: number
}

export interface CreateOrderData {
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  notes?: string
  coupon_code?: string
  items?: CreateOrderItemData[]
}


export const orderService = {
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', data)
    return response.data
  },

  getMyOrders: async (page = 1): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders/me', {
      params: { page },
    })
    return response.data
  },

  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`)
    return response.data
  },

  getByCode: async (code: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/code/${code}`)
    return response.data
  },

  cancelOrder: async (id: number, reason?: string): Promise<Order> => {
    const response = await apiClient.post<Order>(`/orders/${id}/cancel`, { reason })
    return response.data
  },

  // Admin
  getAllOrders: async (page = 1, status?: string): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', {
      params: { page, status },
    })
    return response.data
  },

  updateStatus: async (id: number, status: string): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/admin/orders/${id}/status`, { status })
    return response.data
  },
}
