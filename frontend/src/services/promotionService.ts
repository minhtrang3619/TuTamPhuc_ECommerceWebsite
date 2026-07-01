import apiClient from './apiClient'

export interface PromotionItem {
  id: string | number
  code: string
  name: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  min_order: number
  start_date: string
  end_date: string | null
  applicable_products: string | null
  status: 'active' | 'paused'
  uses: number
  target_customer_tier?: string | null
}

export interface PromotionCreate {
  code: string
  name: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  min_order: number
  start_date: string
  end_date?: string | null
  applicable_products?: string | null
  target_customer_tier?: string | null
}

export interface PromotionUpdate {
  code?: string
  name?: string
  type?: 'percentage' | 'fixed' | 'free_shipping'
  value?: number
  min_order?: number
  start_date?: string
  end_date?: string | null
  applicable_products?: string | null
  status?: 'active' | 'paused'
  target_customer_tier?: string | null
}

export interface PromotionListResponse {
  items: PromotionItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export const promotionService = {
  async getPromotions(params?: {
    skip?: number
    limit?: number
    search?: string
    status_filter?: string
  }) {
    const { data } = await apiClient.get<PromotionListResponse>('/promotions', { params })
    return data
  },

  async createPromotion(promotion: PromotionCreate) {
    const { data } = await apiClient.post<PromotionItem>('/promotions', promotion)
    return data
  },

  async updatePromotion(id: string | number, promotion: PromotionUpdate) {
    const { data } = await apiClient.put<PromotionItem>(`/promotions/${id}`, promotion)
    return data
  },

  async deletePromotion(id: string | number) {
    await apiClient.delete(`/promotions/${id}`)
  }
}
