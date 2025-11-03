import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useOnboardingApi } from './useOnboardingApi'
import type { PartyOnboardingForm, TaxIdType, RegimenType } from '../types'

export function usePartyOnboarding() {
  // Dependencies
  const router = useRouter()
  const { getAccessTokenSilently } = useAuth0()
  const onboardingApi = useOnboardingApi()

  // Form state
  const name = ref('')
  const taxId = ref('')
  const taxIdType = ref<TaxIdType>('CUIT')
  const regimen = ref<RegimenType>('RESPONSABLE_INSCRIPTO')
  const isSubmitting = ref(false)
  const error = ref('')

  // Computed properties
  const canSubmit = computed(() => {
    return !isSubmitting.value &&
      name.value.trim() !== '' &&
      taxId.value.trim() !== ''
  })

  const formData = computed((): PartyOnboardingForm => ({
    name: name.value,
    taxId: taxId.value,
    taxIdType: taxIdType.value,
    regimen: regimen.value
  }))

  // Actions
  const updateName = (value: string) => {
    name.value = value
    clearError()
  }

  const updateTaxId = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '')
    taxId.value = numericValue
    clearError()
  }

  const updateTaxIdType = (value: unknown) => {
    taxIdType.value = value as TaxIdType
    clearError()
  }

  const updateRegimen = (value: RegimenType) => {
    regimen.value = value
    clearError()
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = ''
  }

  // Validation
  const validateForm = (): boolean => {
    clearError()

    if (!name.value.trim()) {
      setError('Por favor, ingresa tu nombre completo')
      return false
    }

    if (!taxId.value.trim()) {
      setError('Por favor, ingresa tu número de identificación')
      return false
    }

    // Validate taxId format based on type
    if (taxIdType.value === 'CUIT' && taxId.value.length !== 11) {
      setError('El CUIT debe tener 11 dígitos')
      return false
    }

    if (taxIdType.value === 'CUIL' && taxId.value.length !== 11) {
      setError('El CUIL debe tener 11 dígitos')
      return false
    }

    if (taxIdType.value === 'DNI' && taxId.value.length !== 8) {
      setError('El DNI debe tener 8 dígitos')
      return false
    }

    return true
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      isSubmitting.value = true

      const companyId = import.meta.env.VITE_COMPANY_ID
      if (!companyId) {
        throw new Error('Company ID not configured')
      }

      await onboardingApi.onboardParty({
        partyType: 'SUPPLIER',
        taxId: taxId.value,
        taxIdType: taxIdType.value,
        name: name.value,
        regimen: regimen.value,
        companyId: companyId as string
      })

      // Wait for Auth0 metadata propagation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Refresh token to get updated metadata
      await handleTokenRefreshAndRedirect()

    } catch (err: unknown) {
      console.error('Onboarding error:', err)
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string })
      setError(
        errorMessage.response?.data?.message ||
        errorMessage.message ||
        'Ha ocurrido un error al completar el registro. Inténtalo de nuevo.'
      )
    } finally {
      isSubmitting.value = false
    }
  }

  // Token refresh and redirect logic
  const handleTokenRefreshAndRedirect = async () => {
    try {
      // Poll for updated tokens with correct metadata (retry up to 3 times)
      let hasCorrectMetadata = false
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Get fresh token with updated metadata
          const tokenResponse = await getAccessTokenSilently({
            cacheMode: 'off',
            detailedResponse: true
          })

          // Check if the token has the correct metadata
          const payload = JSON.parse(atob(tokenResponse.id_token?.split('.')[1] || ''))
          const appMetadata = payload[`${import.meta.env.VITE_AUTH0_AUDIENCE}/app_metadata`] || {}

          if (appMetadata.onboarded === true) {
            hasCorrectMetadata = true
            break
          }

          await new Promise(resolve => setTimeout(resolve, 1500))
        } catch (error) {
          console.error(`Token refresh attempt ${attempt} failed:`, error)
          if (attempt === 3) throw error
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
      }

      if (hasCorrectMetadata) {
        router.push({ name: 'Home' })
      } else {
        // Fallback: reload page to ensure fresh session
        window.location.href = '/'
      }
    } catch (tokenError) {
      console.error('Error refreshing tokens:', tokenError)
      // If token refresh fails, force a complete reload to get fresh session
      window.location.href = '/'
    }
  }

  return {
    // State
    name,
    taxId,
    taxIdType,
    regimen,
    isSubmitting,
    error,

    // Computed
    canSubmit,
    formData,

    // Actions
    updateName,
    updateTaxId,
    updateTaxIdType,
    updateRegimen,
    setError,
    clearError,
    validateForm,
    handleSubmit
  }
}
