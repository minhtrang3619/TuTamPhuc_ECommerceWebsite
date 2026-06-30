import apiClient from './apiClient'
import type { User, PaginatedResponse, UserRole } from '@/types'

export interface GetUsersParams {
  page?: number
  page_size?: number
  role?: UserRole
  is_staff?: boolean
}

export const userService = {
  getUsers: async (params?: GetUsersParams): Promise<User[]> => {
    // Note: API returns List[UserPublic], not a paginated response wrapper according to users.py
    const response = await apiClient.get<User[]>('/users', { params })
    return response.data
  },

  updateUserRole: async (userId: number, role: UserRole): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${userId}/role`, null, {
      params: { role }
    })
    return response.data
  },

  toggleUserActive: async (userId: number): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${userId}/toggle-active`)
    return response.data
  }
}
