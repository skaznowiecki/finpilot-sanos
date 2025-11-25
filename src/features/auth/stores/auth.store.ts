import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Company, Party, LoginRequest, RegisterRequest } from '@/features/auth/types'
import { authService } from '@/features/auth/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const company = ref<Company | null>(null)
  const party = ref<Party | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  const isOnboarded = computed(() => !!user.value?.companyId)

  async function login(credentials: LoginRequest) {
    const response = await authService.login(credentials)
    token.value = response.token
    // Fetch full profile from /auth/me to get user, company, and party data
    await refreshUser()
  }

  async function register(data: RegisterRequest) {
    const response = await authService.register(data)
    token.value = response.token
    // Fetch full profile from /auth/me to get user, company, and party data
    await refreshUser()
  }

  function logout() {
    authService.logout()
    token.value = null
    user.value = null
    company.value = null
    party.value = null
  }

  async function refreshUser() {
    try {
      const profile = await authService.getProfile()
      user.value = profile.user
      company.value = profile.company
      party.value = profile.party
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  async function requestPasswordReset(email: string) {
    await authService.requestPasswordReset(email)
  }

  async function resetPassword(data: { code: string; password: string }) {
    await authService.resetPassword(data)
  }

  return {
    user,
    company,
    party,
    token,
    isAuthenticated,
    isOnboarded,
    login,
    register,
    logout,
    refreshUser,
    requestPasswordReset,
    resetPassword
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    pick: ['user', 'company', 'party', 'token']
  }
})
