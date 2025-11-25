import { ref, computed } from 'vue'
import { useInvoiceApi } from './useInvoiceApi'
import { useTagsStore } from '@/features/tags/stores/tags.store'
import { SupportedFileType } from '../types'
import type {
    ExtractedInvoiceData,
    CreateInvoiceRequest
} from '../types'

export function useInvoiceUpload() {
    const { getPresignedUrls, uploadToS3, extractInvoiceData, createInvoice } = useInvoiceApi()
    const tagsStore = useTagsStore()

    // State
    const selectedFile = ref<File | null>(null)
    const isUploading = ref(false)
    const isExtracting = ref(false)
    const isCreating = ref(false)
    const uploadProgress = ref(0)
    const extractedData = ref<ExtractedInvoiceData | null>(null)
    const invoiceFileId = ref<string | null>(null)
    const error = ref<string | null>(null)

    // Computed
    const isProcessing = computed(() => isUploading.value || isExtracting.value || isCreating.value)
    const canProceed = computed(() => selectedFile.value && !isProcessing.value)
    const canConfirm = computed(() => extractedData.value && !isProcessing.value)

    // File validation
    const validateFile = (file: File): string | null => {
        const maxSize = 10 * 1024 * 1024 // 10MB
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']

        if (file.size > maxSize) {
            return 'El archivo es demasiado grande. Máximo 10MB.'
        }

        if (!allowedTypes.includes(file.type)) {
            return 'Tipo de archivo no soportado. Use PDF, PNG o JPG.'
        }

        return null
    }

    // Get file type from extension
    const getFileTypeFromExtension = (extension: string): SupportedFileType | null => {
        const ext = extension.toLowerCase()
        switch (ext) {
            case 'pdf': return SupportedFileType.PDF
            case 'png': return SupportedFileType.PNG
            case 'jpg': return SupportedFileType.JPG
            case 'jpeg': return SupportedFileType.JPEG
            default: return null
        }
    }

    // Select file
    const selectFile = (file: File) => {
        error.value = null

        const validationError = validateFile(file)
        if (validationError) {
            error.value = validationError
            return false
        }

        selectedFile.value = file
        return true
    }

    // Upload and extract data
    const uploadAndExtract = async () => {
        if (!selectedFile.value) return

        isUploading.value = true
        isExtracting.value = true
        error.value = null

        try {
            // Get file type
            const extension = selectedFile.value.name.split('.').pop() || ''
            const fileType = getFileTypeFromExtension(extension)

            if (!fileType) {
                throw new Error('Tipo de archivo no soportado')
            }

            // Get presigned URL
            const presignedResponse = await getPresignedUrls({
                files: [{ fileType, count: 1 }]
            })

            if (presignedResponse.urls.length === 0) {
                throw new Error('No se pudo obtener URL de subida')
            }

            const presignedUrl = presignedResponse.urls[0]
            if (!presignedUrl) {
                throw new Error('Presigned URL no disponible')
            }
            
            invoiceFileId.value = presignedUrl.id

            // Upload file
            await uploadToS3(presignedUrl.url, selectedFile.value)
            isUploading.value = false

            // Extract data
            const extracted = await extractInvoiceData(presignedUrl.id)
            extractedData.value = extracted
            isExtracting.value = false

        } catch (err) {
            isUploading.value = false
            isExtracting.value = false
            error.value = err instanceof Error ? err.message : 'Error desconocido'
            throw err
        }
    }

    // Create invoice
    const createInvoiceFromData = async (formData: {
        number: number
        date: string
        amount: number
        description?: string
        selectedTagId?: string
    }) => {
        if (!extractedData.value || !invoiceFileId.value) {
            throw new Error('No hay datos extraídos para crear la factura')
        }

        if (!formData.selectedTagId) {
            throw new Error('Debe seleccionar una unidad de negocio')
        }

        isCreating.value = true
        error.value = null

        try {
            const invoiceData: CreateInvoiceRequest = {
                number: formData.number,
                invoiceType: extractedData.value.invoiceType || 'FACTURA',
                date: formData.date,
                dueDate: extractedData.value.dueDate,
                fileId: invoiceFileId.value,
                subtotal: extractedData.value.totals?.subtotal || formData.amount,
                tax: extractedData.value.totals?.tax || 0,
                total: extractedData.value.totals?.total || formData.amount,
                items: extractedData.value.items?.map(item => ({
                    description: item.description || 'Servicio',
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || formData.amount,
                    subtotal: item.subtotal || formData.amount
                }))
            }

            const result = await createInvoice(invoiceData)
            
            // Assign tag to invoice after successful creation
            if (formData.selectedTagId && result?.id) {
                try {
                    await tagsStore.assignTagToInvoice(result.id, formData.selectedTagId)
                } catch (tagError) {
                    // Log error but don't fail the invoice creation
                    console.error('Error assigning tag to invoice:', tagError)
                    // Optionally, you could show a warning to the user here
                }
            }

            return result

        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error al crear la factura'
            throw err
        } finally {
            isCreating.value = false
        }
    }

    // Reset state
    const reset = () => {
        selectedFile.value = null
        isUploading.value = false
        isExtracting.value = false
        isCreating.value = false
        uploadProgress.value = 0
        extractedData.value = null
        invoiceFileId.value = null
        error.value = null
    }

    return {
        // State
        selectedFile,
        isUploading,
        isExtracting,
        isCreating,
        uploadProgress,
        extractedData,
        invoiceFileId,
        error,

        // Computed
        isProcessing,
        canProceed,
        canConfirm,

        // Methods
        selectFile,
        uploadAndExtract,
        createInvoiceFromData,
        reset
    }
}
