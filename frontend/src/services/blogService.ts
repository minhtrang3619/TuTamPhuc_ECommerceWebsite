import apiClient from './apiClient'
import type { BlogPost, PaginatedResponse } from '@/types'

export const blogService = {
  getAllPublic: async (
    page: number = 1,
    pageSize: number = 10,
    tag?: string
  ): Promise<PaginatedResponse<BlogPost>> => {
    const params: any = { page, page_size: pageSize }
    if (tag) params.tag = tag
    const response = await apiClient.get<PaginatedResponse<BlogPost>>('/blog', { params })
    return response.data
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await apiClient.get<BlogPost>(`/blog/${slug}`)
    return response.data
  },

  getAllManage: async (
    page: number = 1,
    pageSize: number = 9,
    status?: string,
    search?: string
  ): Promise<PaginatedResponse<BlogPost>> => {
    const params: any = { page, page_size: pageSize }
    if (status && status !== 'all') params.status = status
    if (search) params.search = search

    const response = await apiClient.get<PaginatedResponse<BlogPost>>('/blog/manage', {
      params,
    })
    return response.data
  },

  getManageById: async (id: number): Promise<BlogPost> => {
    const response = await apiClient.get<BlogPost>(`/blog/manage/${id}`)
    return response.data
  },

  create: async (data: Partial<BlogPost>): Promise<BlogPost> => {
    const response = await apiClient.post<BlogPost>('/blog', data)
    return response.data
  },

  update: async (id: number, data: Partial<BlogPost>): Promise<BlogPost> => {
    const response = await apiClient.put<BlogPost>(`/blog/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/blog/${id}`)
  },

  uploadThumbnail: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'blog')
    const response = await apiClient.post<{ url: string }>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        folder: 'blog'
      }
    })
    return response.data
  },
}
