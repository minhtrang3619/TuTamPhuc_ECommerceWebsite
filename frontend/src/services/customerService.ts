import apiClient from './apiClient'
import type { Customer } from '@/types'

export const customerService = {
  getAll: async (page = 1, pageSize = 100): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>('/customers', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`)
    return response.data
  },

  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/customers', data)
    return response.data
  },

  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`)
  },
}
