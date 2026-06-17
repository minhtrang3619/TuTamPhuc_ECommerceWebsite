import apiClient from './apiClient'

export interface CharityCampaign {
  id: number;
  name: string;
  slogan?: string;
  description?: string;
  target_amount: number;
  raised_amount: number;
  image_url?: string;
  status: string; // "active", "completed", "closing"
  created_at: string;
  updated_at: string;
}

export interface CharityTransaction {
  id: number;
  campaign_id?: number;
  donor_recipient: string;
  amount: number;
  transaction_type: string; // "donation", "expense"
  description?: string;
  created_at: string;
}

export interface CharityOverview {
  total_fund: number;
  total_donations: number;
  active_campaigns_count: number;
  recent_transactions: CharityTransaction[];
}

export interface PaginatedTransactions {
  items: CharityTransaction[];
  total: number;
  page: number;
  page_size: number;
}

export const charityService = {
  getOverview: async (): Promise<CharityOverview> => {
    const response = await apiClient.get<CharityOverview>('/charity/overview')
    return response.data
  },
  
  getCampaigns: async (): Promise<CharityCampaign[]> => {
    const response = await apiClient.get<CharityCampaign[]>('/charity/campaigns')
    return response.data
  },
  
  createCampaign: async (data: Partial<CharityCampaign>): Promise<CharityCampaign> => {
    const response = await apiClient.post<CharityCampaign>('/charity/campaigns', data)
    return response.data
  },
  
  updateCampaign: async (id: number, data: Partial<CharityCampaign>): Promise<CharityCampaign> => {
    const response = await apiClient.put<CharityCampaign>(`/charity/campaigns/${id}`, data)
    return response.data
  },
  
  deleteCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/charity/campaigns/${id}`)
  },
  
  getTransactions: async (page = 1, pageSize = 20, type?: 'donation' | 'expense'): Promise<PaginatedTransactions> => {
    const params: any = { page, page_size: pageSize }
    if (type) {
      params.transaction_type = type
    }
    const response = await apiClient.get<PaginatedTransactions>('/charity/transactions', { params })
    return response.data
  },
  
  createTransaction: async (data: Partial<CharityTransaction>): Promise<CharityTransaction> => {
    const response = await apiClient.post<CharityTransaction>('/charity/transactions', data)
    return response.data
  }
}
