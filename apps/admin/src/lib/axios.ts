import axios from 'axios'
import { getAuth, signOut } from 'firebase/auth'
import { toast } from 'sonner'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
  const auth = getAuth()
  const user = auth.currentUser
  if (user) {
    try {
      const token = await user.getIdToken()
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    } catch (err) {
      // noop
    }
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message || error.message || 'Request error'

    if (status === 401) {
      toast.error('Сессия истекла. Войдите снова.')
      try {
        await signOut(getAuth())
      } catch {}
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  },
)
