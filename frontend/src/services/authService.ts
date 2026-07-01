import apiClient from './apiClient'
import type { AuthTokens, LoginRequest, RegisterRequest, User } from '@/types'

// Mock Data
const MOCK_TOKENS: AuthTokens = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'Bearer',
}

const MOCK_USER: User = {
  id: 1,
  email: 'admin@gmail.com',
  full_name: 'Khách Hàng',
  role: 'customer',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const IS_MOCK = false

export const authService = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    if (IS_MOCK && data.email === 'admin@gmail.com' && data.password === 'admin123') {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_TOKENS), 1000))
    }
    const response = await apiClient.post<AuthTokens>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    if (IS_MOCK) return
    await apiClient.post('/auth/logout')
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  getMe: async (): Promise<User> => {
    if (IS_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_USER), 500))
    }
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  updateProfile: async (
    userData: { full_name?: string; phone?: string; avatar?: string },
    customerData: { full_name?: string; phone?: string; address?: string; avatar?: string }
  ): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', {
      data: userData,
      customer_data: customerData,
    })
    return response.data
  },

  changePassword: async (data: { current_password: string; new_password: string }): Promise<void> => {
    await apiClient.post('/users/me/change-password', data)
  },

  forgotPasswordPhone: async (phone: string): Promise<{ success: boolean; message: string; demo_password?: string }> => {
    const response = await apiClient.post('/auth/forgot-password-phone', { phone })
    return response.data
  },
}
