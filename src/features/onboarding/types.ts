// Party onboarding types matching API schema
export type PartyType = 'SUPPLIER' | 'EMPLOYEE'

export type TaxIdType = 'CUIT' | 'CUIL' | 'DNI'

export type RegimenType = 'MONOTRIBUTO' | 'RESPONSABLE_INSCRIPTO' | 'EXENTO' | 'CONSUMIDOR_FINAL' | 'OTRO'

export interface PartyOnboardingRequest {
  partyType: PartyType
  taxId: string
  taxIdType: TaxIdType
  name: string
  regimen: RegimenType
  companyId: string
}

export interface PartyOnboardingResponse {
  id: string
  name: string
  partyType: PartyType
  taxId: string
  taxIdType: TaxIdType
  regimen: RegimenType
  companyId: string
  userId: string
  email: string
  isOnboarded: boolean
  onboardedAt: string
  createdAt: string
  updatedAt: string
}

// Form state interface
export interface PartyOnboardingForm {
  name: string
  taxId: string
  taxIdType: TaxIdType
  regimen: RegimenType
}

// Tax ID type options
export const TAX_ID_TYPE_OPTIONS = [
  { value: 'CUIT', label: 'CUIT' },
  { value: 'CUIL', label: 'CUIL' },
  { value: 'DNI', label: 'DNI' }
] as const

// Regimen type options
export const REGIMEN_TYPE_OPTIONS = [
  { value: 'MONOTRIBUTO', label: 'Monotributo' },
  { value: 'RESPONSABLE_INSCRIPTO', label: 'Responsable Inscripto' },
  { value: 'EXENTO', label: 'Exento' },
  { value: 'CONSUMIDOR_FINAL', label: 'Consumidor Final' },
  { value: 'OTRO', label: 'Otro' }
] as const
