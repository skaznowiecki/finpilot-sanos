<template>
  <AuthenticatedLayout>
    <template #title>
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
          </path>
        </svg>
        <div>
          <h1 class="text-3xl font-bold text-foreground">Factura #{{ invoiceNumber }}</h1>
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex items-center gap-3">
        <!-- Go Back Button -->




        <Button @click="goBack" variant="outline" class="flex items-center gap-2 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18">
            </path>
          </svg>
          Volver
        </Button>


      </div>
    </template>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 mb-4">{{ error }}</div>
      <Button @click="fetchInvoice" variant="outline" class="cursor-pointer">
        Intentar de nuevo
      </Button>
    </div>

    <div v-else-if="invoice" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Comments -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                </path>
              </svg>
              <span>Comentarios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceComments :invoice-id="invoiceId" />
          </CardContent>
        </Card>
      </div>

      <!-- Right Column: Invoice Information and Details -->
      <div class="space-y-6">
        <!-- Invoice Information -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
              <span>Información de la factura</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div class="text-sm text-gray-500 mb-1">Cliente</div>
                <div class="font-semibold text-gray-900">{{ invoice.party?.name || '-' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Monto total</div>
                <div class="font-bold text-lg text-gray-900">${{ formatCurrency(invoice.total) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Fecha de emisión</div>
                <div class="font-semibold text-gray-900">{{ formatDate(invoice.date) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Estado</div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 text-sm font-medium rounded-full" :class="getStatusClass(invoice?.invoiceState)">
                    {{ getStatusLabel(invoice?.invoiceState) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Download Button -->
            <div class="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <Button @click="downloadInvoice"
                class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                :disabled="downloading">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
                <span v-if="downloading">Descargando...</span>
                <span v-else>Descargar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Service Details -->
        <Card v-if="invoice.items && invoice.items.length > 0">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
                </path>
              </svg>
              <span>Detalle de servicios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="(item, index) in invoice.items" :key="index"
                class="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ item.description }}</div>
                  <div class="text-sm text-gray-500">
                    Cantidad: {{ item.quantity }} x ${{ formatCurrency(item.unitPrice) }}
                  </div>
                </div>
                <div class="font-semibold text-gray-900">${{ formatCurrency(item.subtotal) }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceApi } from '../composables/useInvoiceApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/formatters'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import InvoiceComments from '../components/InvoiceComments.vue'
import type { Invoice, InvoiceState } from '../types'

const route = useRoute()
const router = useRouter()
const { getInvoice, getDownloadUrl } = useInvoiceApi()

const invoiceId = computed(() => route.params.id as string)
const invoice = ref<Invoice | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const downloading = ref(false)

const invoiceNumber = computed(() => {
  if (!invoice.value) return 'Cargando...'
  return `${invoice.value.number.toString().padStart(3, '0')}`
})


const fetchInvoice = async () => {
  loading.value = true
  error.value = null

  try {
    invoice.value = await getInvoice(invoiceId.value)
  } catch (err) {
    error.value = 'Error al cargar la factura'
    console.error('Error fetching invoice:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}

const downloadInvoice = async () => {
  if (!invoice.value) return

  downloading.value = true
  try {
    const response = await getDownloadUrl(invoice.value.id)
    window.open(response.url, '_blank')
  } catch (err) {
    console.error('Error downloading invoice:', err)
    // TODO: Show error message to user
  } finally {
    downloading.value = false
  }
}

const getStatusClass = (state?: InvoiceState) => {
  if (!state) return 'bg-gray-100 text-gray-800'

  const classes = {
    PENDING: 'bg-teal-100 text-teal-800',
    PRE_APPROVED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAID: 'bg-purple-100 text-purple-800'
  }
  return classes[state] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (state?: InvoiceState) => {
  if (!state) return 'Desconocido'

  const labels = {
    PENDING: 'Pendiente',
    PRE_APPROVED: 'Pre-aprobada',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    PAID: 'Pagada'
  }
  return labels[state] || state
}

onMounted(() => {
  fetchInvoice()
})
</script>
