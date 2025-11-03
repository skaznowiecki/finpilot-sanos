<template>
    <div class="flex flex-col items-center space-y-4">
        <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-teal-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </div>
        <div class="text-center">
            <p class="font-medium text-gray-900">{{ selectedFile?.name }}</p>
            <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile?.size || 0) }}</p>
            <p class="text-sm text-teal-600 mt-2">
                {{ isUploading ? 'Subiendo archivo...' : isExtracting ? 'Extrayendo datos...' : 'Procesando...' }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatFileSize } from '@/lib/formatters'

interface Props {
    selectedFile: File | null
    isUploading: boolean
    isExtracting: boolean
}

defineProps<Props>()
</script>
