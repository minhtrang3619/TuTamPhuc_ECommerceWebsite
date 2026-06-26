import apiClient from './apiClient'

export interface Setting {
  key: string
  value: string
  description?: string
}

export const settingService = {
  getAll: async (): Promise<Setting[]> => {
    const res = await apiClient.get('/settings')
    return res.data
  },

  getMap: async (): Promise<Record<string, string>> => {
    const res = await apiClient.get('/settings')
    const arr: Setting[] = res.data
    return arr.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)
  },
}
