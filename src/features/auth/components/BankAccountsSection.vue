<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Cuentas Bancarias</CardTitle>
        <Button v-if="!showNewForm" variant="outline" size="sm" @click="showNewForm = true" class="cursor-pointer">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Cuenta
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <!-- New Bank Account Form -->
      <NewBankAccountForm v-if="showNewForm" :saving="saving" @submit="handleCreate" @cancel="handleCancelNew"
        @primary-change="handleNewPrimaryChange" />

      <div v-if="bankAccounts.length === 0 && !showNewForm" class="text-center py-8">
        <p class="text-muted-foreground">No hay cuentas bancarias registradas</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="account in bankAccounts" :key="account.id">
          <BankAccountCard :account="account" :saving="saving" :can-delete="bankAccounts.length > 1"
            @update="handleUpdate(account.id, $event)" @delete="handleDelete(account.id)"
            @primary-change="handlePrimaryChange(account.id, $event)" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NewBankAccountForm from '@/features/auth/components/NewBankAccountForm.vue'
import BankAccountCard from '@/features/auth/components/BankAccountCard.vue'
import type { BankAccount, CreateBankAccountRequest, UpdateBankAccountRequest } from '@/features/auth/types'

interface Props {
  bankAccounts: BankAccount[]
  saving?: boolean
}

interface Emits {
  (e: 'create', data: CreateBankAccountRequest): void
  (e: 'update', accountId: string, data: UpdateBankAccountRequest): void
  (e: 'delete', accountId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  saving: false
})

const emit = defineEmits<Emits>()

const showNewForm = ref(false)

// Track editable state for each account
const accountEditableState = reactive<Record<string, { formData: UpdateBankAccountRequest }>>({})

const handleCreate = async (data: CreateBankAccountRequest) => {
  emit('create', data)
  showNewForm.value = false
}

const handleCancelNew = () => {
  showNewForm.value = false
}

const handleUpdate = (accountId: string, data: UpdateBankAccountRequest) => {
  emit('update', accountId, data)
}

const handleDelete = (accountId: string) => {
  emit('delete', accountId)
}

const handlePrimaryChange = (accountId: string, isPrimary: boolean) => {
  if (isPrimary) {
    // Uncheck all other accounts in editable state
    Object.keys(accountEditableState).forEach(id => {
      if (id !== accountId && accountEditableState[id]) {
        accountEditableState[id].formData.isPrimary = false
      }
    })
  }
  // The primary change will be handled when the form is submitted
}

const handleNewPrimaryChange = (isPrimary: boolean) => {
  if (isPrimary) {
    // Uncheck all existing accounts
    Object.keys(accountEditableState).forEach(id => {
      if (accountEditableState[id]) {
        accountEditableState[id].formData.isPrimary = false
      }
    })
  }
}

const canDeleteAccount = (accountId: string): boolean => {
  const account = props.bankAccounts.find(acc => acc.id === accountId)
  if (!account) return false

  // Count how many primary accounts exist
  const primaryAccounts = props.bankAccounts.filter(acc => acc.isPrimary)

  // Can't delete if it's the only account
  if (props.bankAccounts.length === 1) return false

  // Can't delete if it's primary and it's the only primary account
  if (account.isPrimary && primaryAccounts.length === 1) return false

  return true
}
</script>
