import { api } from '../lib/axios'

export type SummaryResponse = {
  totalOrders: number
  revenue: number
  averageCheck: number
  newUsers: number
  revenueSeries: { date: string; value: number }[]
}

export async function getGlobalSummary(range: string, supplierId?: string) {
  const url = supplierId
    ? `/api/analytics/suppliers/${supplierId}/summary`
    : '/api/analytics/global/summary'
  const { data } = await api.get<SummaryResponse>(url, { params: { range } })
  return data
}
