import { useApi } from '@/lib/api'
import type {
  Tag,
  TagWithPartyCount,
  CreateTagRequest,
  UpdateTagRequest,
  ListTagsRequest,
  ListTagsResponse,
  AssignTagToPartyRequest,
  PartyTag,
  InvoiceTag,
  AssignTagToInvoiceRequest
} from '../types'

export function useTagApi() {
  const { get, post, put, delete: del } = useApi()

  return {
    // Tag CRUD operations
    createTag: async (data: CreateTagRequest): Promise<{ tag: Tag }> => {
      const response = await post('/tags', data)
      return response.data
    },

    listTags: async (params: ListTagsRequest = {}): Promise<ListTagsResponse> => {
      const response = await get('/tags', { params })
      return response.data
    },

    getTag: async (tagId: string): Promise<{ tag: TagWithPartyCount }> => {
      const response = await get(`/tags/${tagId}`)
      return response.data
    },

    updateTag: async (tagId: string, data: UpdateTagRequest): Promise<{ tag: Tag }> => {
      const response = await put(`/tags/${tagId}`, data)
      return response.data
    },

    deleteTag: async (tagId: string): Promise<void> => {
      await del(`/tags/${tagId}`)
    },

    // Party-Tag assignment operations
    assignTagToParty: async (partyId: string, data: AssignTagToPartyRequest): Promise<{ partyTag: PartyTag }> => {
      const response = await post(`/parties/${partyId}/tags`, data)
      return response.data
    },

    listPartyTags: async (partyId: string): Promise<{ tags: Tag[] }> => {
      const response = await get(`/parties/${partyId}/tags`)
      return response.data
    },

    unassignTagFromParty: async (partyId: string, tagId: string): Promise<void> => {
      await del(`/parties/${partyId}/tags/${tagId}`)
    },

    // Invoice-Tag assignment operations
    assignTagToInvoice: async (invoiceId: string, data: AssignTagToInvoiceRequest): Promise<{ invoiceTag: InvoiceTag }> => {
      const response = await post(`/invoices/${invoiceId}/tags`, data)
      return response.data
    },

    unassignTagFromInvoice: async (invoiceId: string, tagId: string): Promise<void> => {
      await del(`/invoices/${invoiceId}/tags/${tagId}`)
    }
  }
}

