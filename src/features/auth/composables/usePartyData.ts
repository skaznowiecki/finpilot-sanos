import { ref, computed } from 'vue'
import { usePartyApi } from './usePartyApi'
import type { Party, BankAccount, UpdatePartyRequest, UpdateBankAccountRequest, CreateBankAccountRequest } from '../types'

export function usePartyData() {
  const partyApi = usePartyApi()

  const party = ref<Party | null>(null)
  const bankAccounts = ref<BankAccount[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const hasParty = computed(() => party.value !== null)
  const hasBankAccounts = computed(() => bankAccounts.value.length > 0)

  const fetchParty = async () => {
    try {
      loading.value = true
      error.value = null

      const partyData = await partyApi.getMyParty()
      party.value = partyData

      // Fetch bank accounts if party exists
      if (partyData.id) {
        try {
          const accounts = await partyApi.listMyBankAccounts()
          bankAccounts.value = accounts
        } catch (err) {
          // If bank accounts fail, just log and continue
          console.warn('Failed to fetch bank accounts:', err)
          bankAccounts.value = []
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch party data'
      console.error('Error fetching party:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateParty = async (data: UpdatePartyRequest) => {
    try {
      saving.value = true
      error.value = null

      const updatedParty = await partyApi.updateMyParty(data)
      party.value = updatedParty
      return updatedParty
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update party data'
      console.error('Error updating party:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  const createBankAccount = async (data: CreateBankAccountRequest) => {
    try {
      saving.value = true
      error.value = null

      const newAccount = await partyApi.createBankAccount(data)
      bankAccounts.value.push(newAccount)
      return newAccount
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create bank account'
      console.error('Error creating bank account:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  const updateBankAccount = async (bankAccountId: string, data: UpdateBankAccountRequest) => {
    try {
      saving.value = true
      error.value = null

      const updatedAccount = await partyApi.updateBankAccount(bankAccountId, data)

      // Update the account in the local array
      const index = bankAccounts.value.findIndex(acc => acc.id === bankAccountId)
      if (index !== -1) {
        bankAccounts.value[index] = updatedAccount
      } else {
        bankAccounts.value.push(updatedAccount)
      }

      return updatedAccount
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update bank account'
      console.error('Error updating bank account:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  const deleteBankAccount = async (bankAccountId: string) => {
    try {
      saving.value = true
      error.value = null

      await partyApi.deleteBankAccount(bankAccountId)

      // Remove the account from the local array
      const index = bankAccounts.value.findIndex(acc => acc.id === bankAccountId)
      if (index !== -1) {
        bankAccounts.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete bank account'
      console.error('Error deleting bank account:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  const changePassword = async (password: string, confirmPassword: string): Promise<void> => {
    try {
      error.value = null

      await partyApi.changePassword(password, confirmPassword)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to change password'
      console.error('Error changing password:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    party,
    bankAccounts,
    loading,
    saving,
    error,

    // Computed
    hasParty,
    hasBankAccounts,

    // Actions
    fetchParty,
    updateParty,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    changePassword,
    clearError
  }
}

