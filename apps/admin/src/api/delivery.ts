import { api } from '../lib/axios'

export type Delivery = {
  orderId: string
  driverId?: string
  eta?: string
  status: 'assigned' | 'en_route' | 'delivered'
  updatedAt: string
}

export async function listDelivery(params: { status?: string; driverId?: string; page?: number }) {
  const { data } = await api.get<{ items: Delivery[]; total: number }>('/api/delivery', { params })
  return data
}

export async function assignDriver(body: { orderId: string; driverId: string }) {
  const { data } = await api.post('/api/delivery/assign', body)
  return data
}

export async function updateDelivery(orderId: string, body: { status: Delivery['status'] }) {
  const { data } = await api.post(`/api/delivery/${orderId}/update`, body)
  return data
}
