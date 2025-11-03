<script setup lang="ts">
import { ref, watch } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import { useToast } from './use-toast'
import Toast from '../toast.vue'
import ToastAction from '../toast-action.vue'

const { toasts, dismiss } = useToast()

// Track which toasts are open
const openToasts = ref<Record<string, boolean>>({})

// Watch for new toasts and mark them as open
watch(toasts, (newToasts) => {
  newToasts.forEach(toast => {
    if (!(toast.id in openToasts.value)) {
      openToasts.value[toast.id] = true
    }
  })

  // Remove closed toasts from tracking
  Object.keys(openToasts.value).forEach(id => {
    if (!newToasts.find(t => t.id === id)) {
      delete openToasts.value[id]
    }
  })
}, { immediate: true, deep: true })

const handleClose = (toastId: string) => {
  openToasts.value[toastId] = false
  dismiss(toastId)
}
</script>

<template>
  <div
    class="pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
    <template v-for="toastItem in toasts" :key="toastItem.id">
      <Toast :open="openToasts[toastItem.id] || false" :variant="toastItem.variant" class="pointer-events-auto"
        @update:open="(value: boolean) => !value && handleClose(toastItem.id)">
        <div class="flex items-start gap-3">
          <div class="shrink-0 mt-0.5">
            <CheckCircle2 class="h-5 w-5 text-green-600" />
          </div>
          <div class="grid gap-1 flex-1">
            <div v-if="toastItem.title" class="text-sm font-semibold">{{ toastItem.title }}</div>
            <div v-if="toastItem.description" class="text-sm opacity-90">{{ toastItem.description }}</div>
          </div>
        </div>
        <template v-if="toastItem.action">
          <ToastAction :alt-text="toastItem.action.label" @click="toastItem.action.onClick">
            {{ toastItem.action.label }}
          </ToastAction>
        </template>
      </Toast>
    </template>
  </div>
</template>
