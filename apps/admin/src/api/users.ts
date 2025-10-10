import { api } from '../lib/axios'

export type AdminUser = {
  uid: string
  email: string
  displayName?: string
  role: 'user' | 'driver' | 'supplier' | 'admin'
  status: 'active' | 'blocked'
  createdAt: string
}

export async function listUsers(params: { query?: string; role?: string; page?: number; limit?: number }) {
  const { data } = await api.get<{ items: AdminUser[]; total: number }>('/api/admin/users', { params })
  return data
}

export async function getUser(uid: string) {
  const { data } = await api.get<AdminUser>(`/api/users/${uid}`)
  return data
}

export async function updateUserRole(uid: string, role: AdminUser['role']) {
  const { data } = await api.patch(`/api/users/${uid}/role`, { role })
  return data
}

export async function updateUser(uid: string, body: Partial<AdminUser>) {
  const { data } = await api.patch(`/api/users/${uid}`, body)
  return data
}
