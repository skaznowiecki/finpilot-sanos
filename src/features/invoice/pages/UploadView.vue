<template>
  <AuthenticatedLayout>
    <template #title>
      <h1 class="text-3xl font-bold text-foreground">Nueva Factura</h1>
    </template>

    <template #actions>
      <Button variant="outline" @click="goBack" class="cursor-pointer">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Volver
      </Button>
    </template>

    <template #subtitle>
      <p class="text-muted-foreground">Sube tu factura para comenzar</p>
    </template>

    <div class="w-full">
      <!-- Upload State -->
      <div v-if="!extractedData" class="w-full p-8">
        <div class="flex flex-col items-center justify-center py-12">
          <!-- File Upload Area -->
          <FileUploadArea :is-processing="isProcessing" :selected-file="selectedFile" :is-uploading="isUploading"
            :is-extracting="isExtracting" @file-select="handleFileSelect" @file-drop="handleFileDrop" />

          <!-- Error Message -->
          <div v-if="error" class="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation State -->
      <div v-else class="w-full p-8">
        <Card class="p-8">
          <div class="space-y-8">
            <!-- Success Message -->
            <SuccessMessage :file-name="selectedFile?.name || ''" />

            <!-- Form Title -->
            <div>
              <h2 class="text-2xl font-semibold text-gray-900">Confirma la información de tu factura</h2>
            </div>

            <!-- Invoice Form -->
            <InvoiceForm :form-data="formData" :is-creating="isCreating" @submit="handleSubmit" @cancel="reset"
              @update:form-data="formData = $event" />
          </div>
        </Card>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoiceUpload } from '../composables/useInvoiceUpload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import FileUploadArea from '../components/FileUploadArea.vue'
import InvoiceForm from '../components/InvoiceForm.vue'
import SuccessMessage from '../components/SuccessMessage.vue'

const router = useRouter()
const {
  selectedFile,
  isUploading,
  isExtracting,
  isCreating,
  extractedData,
  error,
  isProcessing,
  selectFile,
  uploadAndExtract,
  createInvoiceFromData,
  reset
} = useInvoiceUpload()

// Form data type matching InvoiceForm
interface InvoiceFormData {
  number: number
  date: string
  amount: number
  description: string
  selectedTagId?: string
}

// Form data
const formData = ref<InvoiceFormData>({
  number: 0,
  date: '',
  amount: 0,
  description: '',
  selectedTagId: undefined
})

// Methods
const handleFileSelect = async (file: File) => {
  const success = selectFile(file)
  if (success) {
    // Automatically start processing
    await uploadAndExtract()
  }
}

const handleFileDrop = async (file: File) => {
  const success = selectFile(file)
  if (success) {
    // Automatically start processing
    await uploadAndExtract()
  }
}

const handleSubmit = async (data: InvoiceFormData) => {
  try {
    await createInvoiceFromData(data)

    // Navigate to invoice list with success message
    router.push({
      name: 'Invoices',
      query: { success: 'Factura creada exitosamente' }
    })
  } catch (err) {
    console.error('Error creating invoice:', err)
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}

// Initialize form with extracted data
onMounted(() => {
  if (extractedData.value) {
    formData.value.number = extractedData.value.number || 0
    formData.value.date = extractedData.value.date || ''
    formData.value.amount = extractedData.value.totals?.total || 0
    formData.value.description = extractedData.value.items?.[0]?.description || ''
  }
})

// Watch for extracted data changes
watch(extractedData, (newData) => {
  if (newData) {
    formData.value.number = newData.number || 0
    formData.value.date = newData.date || ''
    formData.value.amount = newData.totals?.total || 0
    formData.value.description = newData.items?.[0]?.description || ''
  }
})
</script>
