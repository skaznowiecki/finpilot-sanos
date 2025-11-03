export interface Invoice {
    id: string
    number: number
    invoiceType: string
    date: string
    dueDate?: string
    paymentDate?: string
    partyId: string
    subtotal: number
    tax: number
    total: number
    companyId: string
    organizationId: string
    status: InvoiceStatus
    invoiceState: InvoiceState
    rejectReason?: string
    customFields?: Record<string, any>
    createdAt: string
    updatedAt: string
    party?: {
        id: string
        name: string
        taxId: string
    }
    organization?: {
        id: string
        name: string
    }
    invoiceFile?: {
        id: string
        s3Key: string
        fileType: string
    }
    items?: Array<{
        description: string
        quantity: number
        unitPrice: number
        subtotal: number
    }>
}

export type InvoiceStatus = 'PENDING' | 'VALIDATED' | 'REJECTED' | 'PROCESSING' | 'PROCESSED'
export type InvoiceState = 'PENDING' | 'PRE_APPROVED' | 'APPROVED' | 'REJECTED' | 'PAID'

export interface InvoiceListResponse {
    items: Invoice[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface InvoiceListParams {
    page?: number
    limit?: number
}

// Upload flow types
export enum SupportedFileType {
    PDF = 'pdf',
    PNG = 'png',
    JPG = 'jpg',
    JPEG = 'jpeg'
}

export interface PresignedUrlResponse {
    urls: Array<{
        url: string
        key: string
        id: string
    }>
}

export interface GetPresignedUrlsRequest {
    files: Array<{
        fileType: SupportedFileType
        count: number
    }>
}

export interface ExtractedInvoiceData {
    number?: number
    invoiceType?: string
    date?: string
    dueDate?: string
    customer?: {
        name?: string
        taxId?: number
        taxType?: string
        address?: string
    }
    items?: Array<{
        description?: string
        quantity?: number
        unitPrice?: number
        subtotal?: number
    }>
    totals?: {
        subtotal?: number
        tax?: number
        total?: number
    }
}

export interface CreateInvoiceRequest {
    number: number
    invoiceType: string
    pointOfSale?: string
    date: string
    dueDate?: string
    paymentDate?: string
    fileId?: string
    items?: Array<{
        description: string
        quantity: number
        unitPrice: number
        subtotal: number
    }>
    subtotal: number
    tax: number
    total: number
    customFields?: Array<{
        name: string
        value: string
    }>
}

// Comment and attachment types
export interface InvoiceComment {
    id: string
    message: string
    author: {
        userId: string
        name: string
        email: string
    }
    createdAt: string
    updatedAt: string
    edited: boolean
    attachments: CommentAttachment[]
    isDeleted: boolean
    deletedMessage?: string
}

export interface CommentAttachment {
    id: string
    fileName: string
    contentType: string
    fileSizeBytes: number
    createdAt: string
}

export interface CreateCommentRequest {
    message: string
    attachments?: Array<{
        fileId: string
        fileName: string
        contentType: string
        fileSizeBytes: number
    }>
}

export interface CommentListResponse {
    items: InvoiceComment[]
}

export interface CommentAttachmentPresignedUrlRequest {
    files: Array<{
        fileType: 'pdf' | 'jpg' | 'jpeg' | 'png' | 'txt' | 'docx' | 'xlsx'
        count: number
    }>
}

export interface CommentAttachmentPresignedUrlResponse {
    urls: Array<{
        url: string
        key: string
        id: string
    }>
}
