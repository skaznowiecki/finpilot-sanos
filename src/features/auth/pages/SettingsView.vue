<template>
  <AuthenticatedLayout>
    <template #title>
      <h1 class="text-3xl font-bold">Configuración</h1>
    </template>

    <template #actions>
      <Button variant="outline" @click="goBack" class="cursor-pointer">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Volver
      </Button>
    </template>

    <div class="max-w-4xl mx-auto">
      <div class="space-y-8">
        <!-- Loading State -->
        <div v-if="partyData.loading.value" class="text-center py-8">
          <p class="text-muted-foreground">Cargando tus datos...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="partyData.error.value" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ partyData.error.value }}</p>
          <Button @click="partyData.fetchParty()" variant="outline" class="mt-2 cursor-pointer">
            Reintentar
          </Button>
        </div>

        <!-- Party Data Section -->
        <template v-else-if="partyData.hasParty.value">
          <!-- Personal Information Section -->
          <PersonalInformationForm :party="partyData.party.value" :saving="partyData.saving.value"
            @update="handleUpdateParty" @cancel="handleResetPartyForm" />

          <!-- Bank Accounts Section -->
          <BankAccountsSection :bank-accounts="partyData.bankAccounts.value" :saving="partyData.saving.value"
            @create="handleCreateBankAccount" @update="handleUpdateBankAccount" @delete="handleDeleteBankAccount" />

          <!-- Access Section -->
          <AccessSection ref="accessSectionRef" :email="user?.email" @change-password="handleChangePassword" />
        </template>

        <!-- No Party Data -->
        <div v-else class="bg-card rounded-lg border p-6 text-center">
          <p class="text-muted-foreground">No hay datos de party disponibles. Por favor completa tu registro primero.
          </p>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { usePartyData } from '@/features/auth/composables/usePartyData'
import { toast } from '@/components/ui/toast'
import PersonalInformationForm from '@/features/auth/components/PersonalInformationForm.vue'
import BankAccountsSection from '@/features/auth/components/BankAccountsSection.vue'
import AccessSection from '@/features/auth/components/AccessSection.vue'
import { extractErrorMessage } from '@/lib/utils'
import type { RegimenType, TaxIdType, CreateBankAccountRequest, UpdateBankAccountRequest } from '@/features/auth/types'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const router = useRouter()
const partyData = usePartyData()
const accessSectionRef = ref<InstanceType<typeof AccessSection> | null>(null)

const showSuccess = (message: string) => {
  toast({
    description: message
  })
}

const showError = (message: string) => {
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive'
  })
}

const handleUpdateParty = async (data: { name: string; taxId?: string; taxIdType?: TaxIdType; address?: string; regimen?: RegimenType }) => {
  try {
    await partyData.updateParty(data)
    showSuccess('Información personal actualizada exitosamente')
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'No se pudo actualizar la información personal. Por favor, intenta de nuevo.')
    showError(errorMessage)
  }
}

const handleResetPartyForm = () => {
  // The form handles its own reset logic
}

const handleCreateBankAccount = async (data: CreateBankAccountRequest) => {
  try {
    // If marking as primary, ensure we set all others to false
    if (data.isPrimary) {
      // Update all existing accounts to not be primary
      for (const account of partyData.bankAccounts.value) {
        if (account.isPrimary) {
          // Also update via API
          try {
            await partyData.updateBankAccount(account.id, { isPrimary: false })
          } catch (err) {
            console.error('Failed to update existing primary account:', err)
            // Continue with creation even if this fails
          }
        }
      }
    }

    await partyData.createBankAccount(data)
    showSuccess('Cuenta bancaria creada exitosamente')
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'No se pudo crear la cuenta bancaria. Por favor, intenta de nuevo.')
    showError(errorMessage)
  }
}

const handleUpdateBankAccount = async (accountId: string, data: UpdateBankAccountRequest) => {
  try {
    // If marking as primary, ensure all other accounts are not primary
    if (data.isPrimary) {
      for (const otherAccount of partyData.bankAccounts.value) {
        if (otherAccount.id !== accountId && otherAccount.isPrimary) {
          try {
            await partyData.updateBankAccount(otherAccount.id, { isPrimary: false })
          } catch (err) {
            console.error('Failed to update other primary account:', err)
            // Continue with update even if this fails
          }
        }
      }
    }

    await partyData.updateBankAccount(accountId, data)
    // Refresh party data to get updated bank accounts
    await partyData.fetchParty()
    showSuccess('Cuenta bancaria actualizada exitosamente')
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'No se pudo actualizar la cuenta bancaria. Por favor, intenta de nuevo.')
    showError(errorMessage)
  }
}

const handleDeleteBankAccount = async (accountId: string) => {
  const account = partyData.bankAccounts.value.find(acc => acc.id === accountId)
  if (!account) return

  // Check if we can delete
  const primaryAccounts = partyData.bankAccounts.value.filter(acc => acc.isPrimary)

  if (partyData.bankAccounts.value.length === 1) {
    alert('No puedes eliminar esta cuenta. Debe existir al menos una cuenta principal.')
    return
  }

  if (account.isPrimary && primaryAccounts.length === 1) {
    alert('No puedes eliminar esta cuenta. Debe existir al menos una cuenta principal.')
    return
  }

  // Confirm deletion
  if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta bancaria?')) {
    return
  }

  try {
    await partyData.deleteBankAccount(accountId)
    showSuccess('Cuenta bancaria eliminada exitosamente')
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'No se pudo eliminar la cuenta bancaria. Por favor, intenta de nuevo.')
    showError(errorMessage)
  }
}

const handleChangePassword = async (password: string, confirmPassword: string) => {
  if (accessSectionRef.value) {
    accessSectionRef.value.setLoading(true)
    accessSectionRef.value.setError('')
    accessSectionRef.value.setSuccess('')
  }

  try {
    await partyData.changePassword(password, confirmPassword)
    if (accessSectionRef.value) {
      accessSectionRef.value.setSuccess('Contraseña cambiada exitosamente')
      accessSectionRef.value.resetForm()
    }
    showSuccess('Contraseña cambiada exitosamente')
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error, 'No se pudo cambiar la contraseña. Por favor, intenta de nuevo.')

    if (accessSectionRef.value) {
      accessSectionRef.value.setError(errorMessage)
    }

    showError(errorMessage)
  } finally {
    if (accessSectionRef.value) {
      accessSectionRef.value.setLoading(false)
    }
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}

// Fetch party data on mount
onMounted(async () => {
  try {
    await partyData.fetchParty()
  } catch (error) {
    console.error('Failed to fetch party data:', error)
  }
})
</script>
