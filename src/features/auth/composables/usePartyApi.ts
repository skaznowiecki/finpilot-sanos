import { useApi } from '@/lib/api'
import type { Party, BankAccount, UpdatePartyRequest, UpdateBankAccountRequest, CreateBankAccountRequest } from '../types'

export function usePartyApi() {
  const { get, put, post, delete: deleteRequest } = useApi()

  const getMyParty = async (): Promise<Party> => {
    const response = await get('/parties/me')
    return response.data
  }

  const updateMyParty = async (data: UpdatePartyRequest): Promise<Party> => {
    const response = await put('/parties/me', data)
    return response.data
  }

  const listMyBankAccounts = async (): Promise<BankAccount[]> => {
    const response = await get('/parties/me/bank-accounts')
    return response.data
  }

  const createBankAccount = async (data: CreateBankAccountRequest): Promise<BankAccount> => {
    const response = await post('/parties/me/bank-accounts', data)
    return response.data
  }

  const updateBankAccount = async (
    bankAccountId: string,
    data: UpdateBankAccountRequest
  ): Promise<BankAccount> => {
    const response = await put(`/parties/me/bank-accounts/${bankAccountId}`, data)
    return response.data
  }

  const deleteBankAccount = async (bankAccountId: string): Promise<void> => {
    await deleteRequest(`/parties/me/bank-accounts/${bankAccountId}`)
  }

  const changePassword = async (password: string, confirmPassword: string): Promise<void> => {
    await post('/parties/me/change-password', {
      password,
      confirmPassword
    })
  }

  return {
    getMyParty,
    updateMyParty,
    listMyBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    changePassword
  }
}

