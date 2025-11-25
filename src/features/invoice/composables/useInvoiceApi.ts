import { useApi } from '@/lib/api'
import type {
  InvoiceListResponse,
  InvoiceListParams,
  PresignedUrlResponse,
  GetPresignedUrlsRequest,
  ExtractedInvoiceData,
  CreateInvoiceRequest,
  CommentListResponse,
  CreateCommentRequest,
  CommentAttachmentPresignedUrlRequest,
  CommentAttachmentPresignedUrlResponse,
  InvoiceComment
} from '../types'

export function useInvoiceApi() {
  const { get, post } = useApi()

  const listInvoices = async (params: InvoiceListParams = {}): Promise<InvoiceListResponse> => {
    const queryParams = new URLSearchParams()

    // Add pagination params
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `/parties/me/invoices?${queryString}` : '/parties/me/invoices'

    const response = await get(url)
    return response.data
  }

  const getInvoice = async (id: string) => {
    const response = await get(`/invoices/${id}`)
    return response.data
  }

  const getPresignedUrls = async (request: GetPresignedUrlsRequest): Promise<PresignedUrlResponse> => {
    const response = await post('/invoices/presigned-urls', request)
    return response.data
  }

  const uploadToS3 = async (presignedUrl: string, file: File): Promise<void> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
  }

  const extractInvoiceData = async (invoiceFileId: string): Promise<ExtractedInvoiceData> => {
    const response = await get(`/invoices/${invoiceFileId}/extract`)
    return response.data
  }

  const createInvoice = async (invoiceData: CreateInvoiceRequest) => {
    const response = await post('/parties/me/invoices', invoiceData)
    return response.data
  }

  const getDownloadUrl = async (invoiceId: string): Promise<{ url: string }> => {
    const response = await get(`/invoices/${invoiceId}/download-url`)
    return response.data
  }

  // Comment-related methods
  const listComments = async (invoiceId: string): Promise<CommentListResponse> => {
    const response = await get(`/invoices/${invoiceId}/comments`)
    return response.data
  }

  const createComment = async (invoiceId: string, data: CreateCommentRequest): Promise<InvoiceComment> => {
    const response = await post(`/invoices/${invoiceId}/comments`, data)
    return response.data
  }

  const getCommentAttachmentPresignedUrls = async (invoiceId: string, request: CommentAttachmentPresignedUrlRequest): Promise<CommentAttachmentPresignedUrlResponse> => {
    const response = await post(`/invoices/${invoiceId}/comments/presigned-urls`, request)
    return response.data
  }

  const getCommentAttachmentDownloadUrl = async (attachmentId: string): Promise<{ url: string }> => {
    const response = await get(`/invoices/comments/attachments/${attachmentId}/download-url`)
    return response.data
  }

  return {
    listInvoices,
    getInvoice,
    getPresignedUrls,
    uploadToS3,
    extractInvoiceData,
    createInvoice,
    getDownloadUrl,
    listComments,
    createComment,
    getCommentAttachmentPresignedUrls,
    getCommentAttachmentDownloadUrl
  }
}
