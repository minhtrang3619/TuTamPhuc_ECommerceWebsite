import apiClient from './apiClient'
import type { Cart } from '@/types'

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>('/cart')
    return response.data
  },

  addItem: async (productId: number, quantity: number, variantId?: number): Promise<Cart> => {
    const response = await apiClient.post<Cart>('/cart/items', {
      product_id: productId,
      quantity,
      variant_id: variantId,
    })
    return response.data
  },

  updateItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const response = await apiClient.patch<Cart>(`/cart/items/${itemId}`, { quantity })
    return response.data
  },

  removeItem: async (itemId: number): Promise<Cart> => {
    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`)
    return response.data
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart')
  },
}
