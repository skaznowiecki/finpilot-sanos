import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useOnboardingApi } from './useOnboardingApi'
import type { PartyOnboardingForm, TaxIdType, RegimenType } from '../types'

export function usePartyOnboarding() {
  // Dependencies
  const router = useRouter()
  const authStore = useAuthStore()
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
    // Only allow numeric input - remove all non-numeric characters including hyphens
    const numericValue = value.replace(/[^0-9]/g, '')
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

      // Refresh user profile to get updated companyId
      await authStore.refreshUser()

      if (authStore.isOnboarded) {
        router.push({ name: 'Home' })
      } else {
        // Fallback: reload page to ensure fresh session
        window.location.href = '/'
      }

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
