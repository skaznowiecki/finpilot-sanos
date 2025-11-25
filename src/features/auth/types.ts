export type UserRole = 'READ' | 'WRITE' | 'ADMIN'
export type UserType = 'ADMINISTRATOR' | 'PARTY'
export type PartyType = 'EMPLOYEE' | 'SUPPLIER'
export type TaxIdType = 'CUIT' | 'CUIL' | 'DNI' | 'PASSPORT' | 'FOREIGN_ID' | 'OTHER'
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
export type RegimenType = 'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTO' | 'EXENTO' | 'OTRO'

export interface User {
  id: string
  email: string
  name: string | null
  companyId: string | null
  role: UserRole | null
  type: UserType
  isActive: boolean
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
  } | null
}

export interface Company {
  id: string
  name: string
  companySize: string | null
  createdAt: string
  updatedAt: string
}

export interface Party {
  id: string
  partyType: PartyType
  taxId: string
  taxIdType: TaxIdType
  name: string
  email: string | null
  address: string | null
  category: string | null
  status: EmploymentStatus | null
  regimen: RegimenType | null
  isOnboarded: boolean
  createdAt: string
  updatedAt: string
}

export interface MeResponse {
  user: User
  company: Company | null
  party: Party | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
  type?: UserType
}

export interface RegisterResponse {
  token: string
  user: User
}

export interface BankAccount {
  id: string
  bankName: string | null
  accountNumber: string | null
  isPrimary: boolean
}

export interface CreateBankAccountRequest {
  bankName: string | null
  accountNumber: string | null
  isPrimary: boolean
}

export interface UpdateBankAccountRequest {
  bankName?: string | null
  accountNumber?: string | null
  isPrimary?: boolean
}


export interface UpdatePartyRequest {
  name?: string
  taxId?: string
  taxIdType?: TaxIdType
  regimen?: RegimenType
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}
