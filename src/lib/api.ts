import { useAuth0 } from '@auth0/auth0-vue'
import axios from 'axios'

export function useApi() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0()

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  })

  api.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently()
      config.headers.Authorization = `Bearer ${token}`
      return config
    } catch (error) {
      // If getting token fails, redirect to login
      console.error('Failed to get access token:', error)
      loginWithRedirect({ appState: { targetUrl: window.location.pathname } })
      throw error
    }
  })

  // Add response interceptor to handle token expiration
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Check if error is related to authentication/authorization
      if (error.response?.status === 401) {
        console.error('Authentication error:', error.response.data)

        // Check if it's specifically a refresh token error
        if (error.response.data?.message?.includes('refresh token') ||
          error.response.data?.error?.includes('refresh token')) {
          console.warn('Refresh token expired, redirecting to login')
          loginWithRedirect({ appState: { targetUrl: window.location.pathname } })
          return Promise.reject(error)
        }
      }

      return Promise.reject(error)
    }
  )

  return {
    get: api.get,
    post: api.post,
    put: api.put,
    delete: api.delete,
    axiosInstance: api, // if you need full access
  }
}
