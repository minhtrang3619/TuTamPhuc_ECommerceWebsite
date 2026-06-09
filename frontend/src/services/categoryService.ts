import apiClient from './apiClient'
import type { Category } from '@/types'

export interface CategoryCreate {
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: number
  sort_order?: number
}

export interface CategoryUpdate {
  name?: string
  slug?: string
  description?: string
  image?: string
  parent_id?: number
  sort_order?: number
}

export const categoryService = {
  /**
   * Lấy danh sách tất cả danh mục
   */
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>('/categories')
    return res.data
  },

  /**
   * Lấy chi tiết một danh mục theo slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const res = await apiClient.get<Category>(`/categories/${slug}`)
    return res.data
  },

  /**
   * Thêm mới một danh mục (Yêu cầu admin)
   */
  async createCategory(data: CategoryCreate): Promise<Category> {
    const res = await apiClient.post<Category>('/categories', data)
    return res.data
  },

  /**
   * Cập nhật một danh mục (Yêu cầu admin)
   */
  async updateCategory(id: number, data: CategoryUpdate): Promise<Category> {
    const res = await apiClient.put<Category>(`/categories/${id}`, data)
    return res.data
  },

  /**
   * Xóa một danh mục (Yêu cầu admin)
   */
  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  }
}
