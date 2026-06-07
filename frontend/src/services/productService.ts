import apiClient from './apiClient'
import type { Product, PaginatedResponse, ProductFilters } from '@/types'

export const productService = {
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params: filters,
    })
    return response.data
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${slug}`)
    return response.data
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`)
    return response.data
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/featured')
    return response.data
  },

  getRelated: async (productId: number): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/products/${productId}/related`)
    return response.data
  },

  // Admin operations
  create: async (data: FormData): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id: number, data: FormData): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}
