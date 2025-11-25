import axios from 'axios'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, MeResponse } from '@/features/auth/types'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Add authorization interceptor
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data)
    return response.data
  },

  logout() {
    // State will be cleared by the store's logout function
    // No need to manually clear localStorage here
  },

  async getProfile(): Promise<MeResponse> {
    const response = await api.get<MeResponse>('/auth/me')
    return response.data
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/request-password-reset', { email })
  },

  async resetPassword(data: { code: string; password: string }): Promise<void> {
    await api.post('/auth/reset-password', data)
  }
}
