import { api } from '../lib/axios'

export type Supplier = {
  id: string
  name: string
  contact: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export async function listSuppliers(params: { status?: string }) {
  const { data } = await api.get<{ items: Supplier[]; total: number }>('/api/admin/suppliers', { params })
  return data
}

export async function getSupplier(id: string) {
  const { data } = await api.get(`/api/suppliers/${id}`)
  return data
}

export async function verifySupplier(id: string, body: { status: 'approved' | 'rejected'; reason?: string }) {
  const { data } = await api.post(`/api/admin/suppliers/${id}/verify`, body)
  return data
}
