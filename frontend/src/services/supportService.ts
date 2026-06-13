import apiClient from './apiClient'
import type { SupportTicket } from '@/types'

export const supportService = {
  getMyTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get<SupportTicket[]>('/support/tickets/my')
    return response.data
  },

  createTicket: async (data: {
    subject: string
    description: string
    category: string
    priority?: string
  }): Promise<SupportTicket> => {
    const response = await apiClient.post<SupportTicket>('/support/tickets', data)
    return response.data
  },

  getAllTickets: async (status?: string): Promise<SupportTicket[]> => {
    const params: any = {}
    if (status && status !== 'all') {
      params.status = status
    }
    const response = await apiClient.get<SupportTicket[]>('/support/tickets', { params })
    return response.data
  },

  updateTicket: async (
    id: number,
    data: { status?: string; priority?: string }
  ): Promise<SupportTicket> => {
    const response = await apiClient.put<SupportTicket>(`/support/tickets/${id}`, data)
    return response.data
  },
}

export default supportService
