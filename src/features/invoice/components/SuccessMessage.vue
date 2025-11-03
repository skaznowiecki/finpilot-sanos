<template>
    <div class="bg-green-50 border border-green-200 rounded-lg p-6">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div>
                <p class="font-medium text-green-900">{{ fileName }}</p>
                <p class="text-sm text-green-700">Archivo cargado exitosamente</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    fileName: string
}

defineProps<Props>()
</script>
