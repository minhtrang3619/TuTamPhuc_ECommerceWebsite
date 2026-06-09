import apiClient from './apiClient'
import type { Product } from '@/types'

export const wishlistService = {
  getWishlist: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/wishlist')
    return response.data
  },

  addToWishlist: async (productId: number): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/wishlist/${productId}`)
    return response.data
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    await apiClient.delete(`/wishlist/${productId}`)
  },
}

export default wishlistService
