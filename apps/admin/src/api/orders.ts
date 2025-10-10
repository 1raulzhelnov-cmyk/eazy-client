import { api } from '../lib/axios'

export type Order = {
  id: string
  customerEmail: string
  supplierName: string
  amount: number
  status: string
  paymentStatus?: string
  createdAt: string
}

export async function listOrders(params: Record<string, any>) {
  const { data } = await api.get<{ items: Order[]; total: number }>('/api/orders', { params })
  return data
}

export async function getOrder(id: string) {
  const { data } = await api.get(`/api/orders/${id}`)
  return data
}

export async function transitionOrder(id: string, body: { action: string }) {
  const { data } = await api.post(`/api/orders/${id}/transition`, body)
  return data
}
