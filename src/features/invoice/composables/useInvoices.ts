import { ref, computed } from 'vue'
import { useInvoiceApi } from './useInvoiceApi'
import type { Invoice, InvoiceListParams } from '../types'

export function useInvoices() {
  const { listInvoices, getDownloadUrl } = useInvoiceApi()

  const invoices = ref<Invoice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  const hasInvoices = computed(() => invoices.value.length > 0)
  const isEmpty = computed(() => !loading.value && invoices.value.length === 0)

  const fetchInvoices = async (params: InvoiceListParams = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams: InvoiceListParams = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      }

      const response = await listInvoices(queryParams)

      invoices.value = response.items
      pagination.value = response.pagination
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch invoices'
      console.error('Error fetching invoices:', err)
    } finally {
      loading.value = false
    }
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      pagination.value.page = page
      await fetchInvoices()
    }
  }

  const refreshInvoices = async () => {
    await fetchInvoices()
  }

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const { url } = await getDownloadUrl(invoiceId)
      // Open the download URL in a new tab
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error downloading invoice:', err)
      throw err
    }
  }

  return {
    // State
    invoices,
    loading,
    error,
    pagination,

    // Computed
    hasInvoices,
    isEmpty,

    // Actions
    fetchInvoices,
    goToPage,
    refreshInvoices,
    downloadInvoice
  }
}
