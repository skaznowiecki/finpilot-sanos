<template>
  <div class="space-y-4">

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-4">{{ error }}</div>
      <Button @click="refreshInvoices" variant="outline" class="cursor-pointer">
        Try Again
      </Button>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="text-center py-12">
      <div class="text-gray-500 mb-4">No se encontraron facturas</div>
      <Button @click="refreshInvoices" variant="outline" class="cursor-pointer">
        Actualizar
      </Button>
    </div>

    <!-- Invoice List -->
    <div v-else class="space-y-4">
      <div v-for="invoice in invoices" :key="invoice.id"
        class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-center">
          <!-- Invoice Info -->
          <div class="flex-1 grid grid-cols-3 gap-8">
            <!-- Number -->
            <div>
              <div class="text-sm text-gray-500 mb-1">Número</div>
              <div class="font-bold text-lg text-gray-900">{{ invoice.number.toString().padStart(3, '0') }}</div>
            </div>

            <!-- Date -->
            <div>
              <div class="text-sm text-gray-500 mb-1">Fecha</div>
              <div class="font-semibold text-gray-900">{{ formatDate(invoice.date) }}</div>
            </div>

            <!-- Amount -->
            <div>
              <div class="text-sm text-gray-500 mb-1">Monto</div>
              <div class="font-bold text-lg text-gray-900">${{ formatCurrency(invoice.total) }}</div>
            </div>
          </div>

          <!-- Status and Actions -->
          <div class="flex items-center gap-4">
            <!-- Status Badge -->
            <span class="px-3 py-1 text-sm font-medium rounded-full" :class="getStatusClass(invoice.invoiceState)">
              {{ getStatusLabel(invoice.invoiceState) }}
            </span>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <Button @click="viewInvoice(invoice.id)" size="sm" variant="ghost" class="p-2 cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                  </path>
                </svg>
              </Button>
              <Button @click="downloadInvoice(invoice.id)" size="sm" variant="ghost" class="p-2 cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="hasInvoices && pagination.totalPages > 1" class="flex justify-between items-center mt-8">
      <div class="text-sm text-gray-600">
        Mostrando {{ ((pagination.page - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.page * pagination.limit,
          pagination.total) }} de {{ pagination.total }} facturas
      </div>

      <div class="flex items-center gap-2">
        <Button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1" variant="outline" size="sm"
          class="px-3 py-2 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Button>

        <div class="flex gap-1">
          <Button v-for="page in getVisiblePages()" :key="page" @click="goToPage(page)"
            :class="page === pagination.page ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
            variant="outline" size="sm" class="px-3 py-2 min-w-[40px] cursor-pointer">
            {{ page }}
          </Button>
        </div>

        <Button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages"
          variant="outline" size="sm" class="px-3 py-2 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoices } from '../composables/useInvoices'
import { Button } from '@/components/ui/button'
import type { InvoiceState } from '../types'
import { formatDate, formatCurrency } from '@/lib/formatters'

const router = useRouter()

const {
  invoices,
  loading,
  error,
  pagination,
  hasInvoices,
  isEmpty,
  goToPage,
  refreshInvoices,
  fetchInvoices,
  downloadInvoice
} = useInvoices()

const viewInvoice = (invoiceId: string) => {
  router.push({ name: 'InvoiceDetail', params: { id: invoiceId } })
}

onMounted(() => {
  fetchInvoices()
})

const getStatusClass = (state: InvoiceState) => {
  const classes = {
    PENDING: 'bg-teal-100 text-teal-800',
    PRE_APPROVED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAID: 'bg-purple-100 text-purple-800'
  }
  return classes[state] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (state: InvoiceState) => {
  const labels = {
    PENDING: 'Pendiente',
    PRE_APPROVED: 'Pre-aprobada',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    PAID: 'Pagada'
  }
  return labels[state] || state
}

// Using centralized formatters from @/lib/formatters

const getVisiblePages = () => {
  const current = pagination.value.page
  const total = pagination.value.totalPages
  const pages = []

  // Show up to 2 pages around current page
  const start = Math.max(1, current - 1)
  const end = Math.min(total, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}
</script>
