<template>
    <Card class="w-full max-w-2xl p-12">
        <div class="flex flex-col items-center space-y-6">
            <!-- Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-16 transition-colors hover:border-teal-400 w-full"
                :class="{
                    'border-teal-500 bg-teal-50': isDragOver,
                    'cursor-pointer': !isProcessing,
                    'cursor-not-allowed opacity-50': isProcessing
                }" @drop="!isProcessing ? handleDrop : null" @dragover="!isProcessing ? handleDragOver : null"
                @dragleave="!isProcessing ? handleDragLeave : null" @click="!isProcessing ? triggerFileInput : null">
                <div class="flex flex-col items-center space-y-6">
                    <!-- Upload State -->
                    <div v-if="!selectedFile" class="flex flex-col items-center space-y-6">
                        <!-- Upload Icon -->
                        <div class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                            <svg class="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>

                        <div class="text-center space-y-3">
                            <h3 class="text-2xl font-bold text-gray-900">Subir Factura</h3>
                            <p class="text-gray-600">Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
                            <p class="text-sm text-gray-500">Formatos aceptados: PDF, PNG, JPG</p>
                        </div>

                        <!-- File Input (hidden) -->
                        <input ref="fileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" class="hidden"
                            @change="handleFileSelect" />

                        <!-- Select Button -->
                        <Button type="button"
                            class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
                            @click="triggerFileInput">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Seleccionar Archivo
                        </Button>
                    </div>

                    <!-- Processing State -->
                    <div v-if="selectedFile && isProcessing" class="flex flex-col items-center space-y-4">
                        <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-teal-600 animate-spin" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div class="text-center">
                            <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
                            <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                            <p class="text-sm text-teal-600 mt-2">
                                {{ isUploading ? 'Subiendo archivo...' : isExtracting ? 'Extrayendo datos...' :
                                'Procesando...' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatFileSize } from '@/lib/formatters'

interface Props {
    isProcessing: boolean
    selectedFile: File | null
    isUploading: boolean
    isExtracting: boolean
}

interface Emits {
    (e: 'file-select', file: File): void
    (e: 'file-drop', file: File): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        emit('file-select', file)
        // Clear the file input
        target.value = ''
    }
}

const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
        emit('file-drop', files[0])
    }
}

const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = true
}

const handleDragLeave = () => {
    isDragOver.value = false
}
</script>
