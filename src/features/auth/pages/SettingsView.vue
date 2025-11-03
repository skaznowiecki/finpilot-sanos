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
import { onMounted, ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { usePartyData } from '../composables/usePartyData'
import { toast } from '@/components/ui/toast'
import PersonalInformationForm from '../components/PersonalInformationForm.vue'
import BankAccountsSection from '../components/BankAccountsSection.vue'
import AccessSection from '../components/AccessSection.vue'
import type { RegimenType, TaxIdType } from '@/features/onboarding/types'
import type { CreateBankAccountRequest, UpdateBankAccountRequest } from '../types'

const { user } = useAuth0()
const router = useRouter()
const partyData = usePartyData()
const accessSectionRef = ref<InstanceType<typeof AccessSection> | null>(null)

const showSuccess = (message: string) => {
  toast({
    description: message
  })
}

const handleUpdateParty = async (data: { name: string; taxId?: string; taxIdType?: TaxIdType; address?: string; regimen?: RegimenType }) => {
  try {
    await partyData.updateParty(data)
    showSuccess('Información personal actualizada exitosamente')
  } catch (error) {
    console.error('Failed to update party:', error)
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
          }
        }
      }
    }

    await partyData.createBankAccount(data)
    showSuccess('Cuenta bancaria creada exitosamente')
  } catch (error) {
    console.error('Failed to create bank account:', error)
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
          }
        }
      }
    }

    await partyData.updateBankAccount(accountId, data)
    // Refresh party data to get updated bank accounts
    await partyData.fetchParty()
    showSuccess('Cuenta bancaria actualizada exitosamente')
  } catch (error) {
    console.error('Failed to update bank account:', error)
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
    console.error('Failed to delete bank account:', error)
    alert('Error al eliminar la cuenta bancaria')
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
    console.error('Error changing password:', error)
    const errorMessage = error instanceof Error
      ? error.message
      : 'No se pudo cambiar la contraseña. Por favor, intenta de nuevo.'

    if (accessSectionRef.value) {
      accessSectionRef.value.setError(errorMessage)
    }

    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  } finally {
    if (accessSectionRef.value) {
      accessSectionRef.value.setLoading(false)
    }
  }
}

const goBack = () => {
  router.go(-1)
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
