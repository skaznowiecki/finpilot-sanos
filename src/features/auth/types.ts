import type { TaxIdType, RegimenType } from '../onboarding/types'

export interface BankAccount {
  id: string
  partyId: string
  alias?: string | null
  bankName?: string | null
  bankCode?: string | null
  branchCode?: string | null
  accountNumber?: string | null
  accountType?: string | null
  currency?: string | null
  taxIdHolder?: string | null
  isPrimary?: boolean | null
  effectiveDate?: string | null
  expirationDate?: string | null
  swiftCode?: string | null
  correspondentBank?: string | null
  bankAddress?: string | null
  createdAt: string
  updatedAt: string
}

export interface Party {
  id: string
  partyType: 'EMPLOYEE' | 'SUPPLIER'
  taxId: string
  taxIdType: TaxIdType
  name: string
  email?: string | null
  address?: string | null
  category?: string | null
  regimen?: RegimenType | null
  status?: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | null
  startDate?: string | null
  endDate?: string | null
  companyId: string
  bankAccounts?: BankAccount[]
  createdAt: string
  updatedAt: string
}

export interface UpdatePartyRequest {
  name?: string
  taxId?: string
  taxIdType?: TaxIdType
  email?: string
  address?: string
  category?: string
  regimen?: RegimenType
  status?: 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
  startDate?: string
  endDate?: string
}

export interface CreateBankAccountRequest {
  alias?: string | null
  bankName?: string | null
  bankCode?: string | null
  branchCode?: string | null
  accountNumber?: string | null
  accountType?: string | null
  currency?: string | null
  taxIdHolder?: string | null
  isPrimary?: boolean | null
  effectiveDate?: string | null
  expirationDate?: string | null
  swiftCode?: string | null
  correspondentBank?: string | null
  bankAddress?: string | null
}

export interface UpdateBankAccountRequest {
  alias?: string | null
  bankName?: string | null
  bankCode?: string | null
  branchCode?: string | null
  accountNumber?: string | null
  accountType?: string | null
  currency?: string | null
  taxIdHolder?: string | null
  isPrimary?: boolean | null
  effectiveDate?: string | null
  expirationDate?: string | null
  swiftCode?: string | null
  correspondentBank?: string | null
  bankAddress?: string | null
}
