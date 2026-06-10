import apiClient from './apiClient'
import type { UserAddress } from '@/types'

// Helper to map backend snake_case to frontend camelCase UserAddress
const mapAddress = (data: any): UserAddress => ({
  id: data.id,
  user_id: data.user_id,
  name: data.name,
  phone: data.phone,
  province: data.province,
  district: data.district,
  ward: data.ward,
  street: data.street,
  isDefault: data.is_default,
  created_at: data.created_at,
  updated_at: data.updated_at,
})

export const addressService = {
  getAddresses: async (): Promise<UserAddress[]> => {
    const response = await apiClient.get<any[]>('/addresses')
    return response.data.map(mapAddress)
  },

  createAddress: async (address: Omit<UserAddress, 'id' | 'user_id' | 'isDefault' | 'created_at' | 'updated_at'> & { isDefault?: boolean }): Promise<UserAddress> => {
    const payload = {
      name: address.name,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      is_default: address.isDefault || false,
    }
    const response = await apiClient.post<any>('/addresses', payload)
    return mapAddress(response.data)
  },

  updateAddress: async (id: number, address: Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserAddress> => {
    const payload: any = {}
    if (address.name !== undefined) payload.name = address.name
    if (address.phone !== undefined) payload.phone = address.phone
    if (address.province !== undefined) payload.province = address.province
    if (address.district !== undefined) payload.district = address.district
    if (address.ward !== undefined) payload.ward = address.ward
    if (address.street !== undefined) payload.street = address.street
    if (address.isDefault !== undefined) payload.is_default = address.isDefault

    const response = await apiClient.put<any>(`/addresses/${id}`, payload)
    return mapAddress(response.data)
  },

  setDefaultAddress: async (id: number): Promise<UserAddress> => {
    const response = await apiClient.patch<any>(`/addresses/${id}/set-default`)
    return mapAddress(response.data)
  },

  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`)
  },
}

export default addressService
