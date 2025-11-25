export type TagType = 'PARTY' | 'INVOICE'

export interface TagSettings {
  paymentDatePolicy?: number | null
  [key: string]: any
}

export interface Tag {
  id: string
  companyId: string
  name: string
  color?: string
  type: TagType
  settings?: TagSettings | null
  createdAt: string
  updatedAt: string
}

export interface TagWithPartyCount extends Tag {
  _count: {
    parties?: number
    invoices?: number
  }
}

export interface CreateTagRequest {
  name: string
  color?: string
  type?: TagType
  settings?: TagSettings
}

export interface UpdateTagRequest {
  name?: string
  color?: string
  settings?: TagSettings
}

export interface ListTagsRequest {
  page?: number
  limit?: number
  search?: string
  type?: TagType
}

export interface ListTagsResponse {
  tags: TagWithPartyCount[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AssignTagToPartyRequest {
  tagId: string
}

export interface PartyTag {
  id: string
  partyId: string
  tagId: string
  createdAt: string
}

export interface InvoiceTag {
  id: string
  invoiceId: string
  tagId: string
  createdAt: string
}

export interface AssignTagToInvoiceRequest {
  tagId: string
}

