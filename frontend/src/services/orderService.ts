import apiClient from './apiClient'
import type { Order, ShippingAddress, PaymentMethod, PaginatedResponse, ReturnRequest, ReturnRequestCreate, ReturnRequestStatus } from '@/types'

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

  payOrder: async (code: string): Promise<Order> => {
    const response = await apiClient.post<Order>(`/orders/code/${code}/pay`)
    return response.data
  },

  cancelOrder: async (id: number, reason?: string): Promise<Order> => {
    const response = await apiClient.post<Order>(`/orders/${id}/cancel`, { reason })
    return response.data
  },

  // Admin
  getAllOrders: async (page = 1, status?: string): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', {
      params: { page, order_status: status },
    })
    return response.data
  },

  updateStatus: async (id: number, status?: string, paymentStatus?: string): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, {
      status,
      payment_status: paymentStatus,
    })
    return response.data
  },

  // Return & Refund
  uploadReturnEvidence: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<{ url: string }>('/uploads/return-evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  submitReturnRequest: async (orderId: number, data: ReturnRequestCreate): Promise<ReturnRequest> => {
    const response = await apiClient.post<ReturnRequest>(`/orders/${orderId}/return`, data)
    return response.data
  },

  getReturnRequests: async (page = 1): Promise<PaginatedResponse<ReturnRequest>> => {
    const response = await apiClient.get<PaginatedResponse<ReturnRequest>>('/orders/returns', {
      params: { page },
    })
    return response.data
  },

  updateReturnRequestStatus: async (returnId: number, status: ReturnRequestStatus): Promise<ReturnRequest> => {
    const response = await apiClient.patch<ReturnRequest>(`/orders/returns/${returnId}/status`, { status })
    return response.data
  },
}

