import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export function useApi() {
  const router = useRouter()
  const authStore = useAuthStore()

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })

  api.interceptors.request.use((config) => {
    // Get token from store (which is persisted to localStorage by the plugin)
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Authentication error, redirecting to login')
        // Clear auth store state (which will also clear localStorage via the plugin)
        authStore.logout()
        router.push({ name: 'Login' })
      }
      return Promise.reject(error)
    }
  )

  return {
    get: api.get,
    post: api.post,
    put: api.put,
    delete: api.delete,
    axiosInstance: api,
  }
}

