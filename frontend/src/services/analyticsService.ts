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
  gross_profit?: number;
  gross_profitChange?: number;
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
  trafficChannels?: { name: string; value: number }[];
}

export interface StockDepletionForecast {
  id: number;
  name: string;
  sku: string;
  stock: number;
  velocity: number;
  daysRemaining: number;
  reorderQuantity: number;
  priority: 'critical' | 'warning';
  image: string;
}

export interface DemandForecast {
  id: number;
  name: string;
  sku: string;
  currentSales30d: number;
  projectedSales: number;
  growthRate: number;
  confidence: string;
  seasonalityFactor: string;
  image: string;
}

export interface OverstockForecast {
  id: number;
  name: string;
  sku: string;
  stock: number;
  daysWithoutSales: number;
  holdingCostEst: number;
  recommendation: string;
  image: string;
}

export interface ForecastData {
  stockDepletion: StockDepletionForecast[];
  demandForecast: DemandForecast[];
  overstockRisk: OverstockForecast[];
}

export const analyticsService = {
  getReportData: async (period: '7days' | '30days' | 'year'): Promise<ReportData> => {
    const response = await apiClient.get<ReportData>('/analytics/reports', {
      params: { period }
    })
    return response.data
  },
  getForecastData: async (): Promise<ForecastData> => {
    const response = await apiClient.get<ForecastData>('/analytics/forecast')
    return response.data
  },
  exportReportsCsv: async (period: '7days' | '30days' | 'year'): Promise<void> => {
    const response = await apiClient.get('/analytics/reports/export', {
      params: { period },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `bao_cao_tu_tam_phuc_${period}.csv`)
    document.body.appendChild(link)
    link.click()
    
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

