import apiClient from './apiClient'

export interface PeriodSummary {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  aov: number;
  aovChange: number;
  conversion: number;
  conversionChange: number;
  charity: number;
  charityChange: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TopProduct {
  name: string;
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface CharityProject {
  name: string;
  raised: number;
  target: number;
  status: string;
}

export interface ReportData {
  summary: PeriodSummary;
  chartData: ChartDataPoint[];
  topProducts: TopProduct[];
  charityProjects: CharityProject[];
}

export const analyticsService = {
  getReportData: async (period: '7days' | '30days' | 'year'): Promise<ReportData> => {
    const response = await apiClient.get<ReportData>('/analytics/reports', {
      params: { period }
    })
    return response.data
  }
}
