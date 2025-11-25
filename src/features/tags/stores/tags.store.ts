import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tag, TagType } from '../types'
import { useTagApi } from '../composables/useTagApi'

export const useTagsStore = defineStore('tags', () => {
  const tagApi = useTagApi()

  // State
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Cache expiration time: 5 minutes
  const CACHE_EXPIRATION_MS = 5 * 60 * 1000

  // Computed
  const invoiceTags = computed(() => {
    return tags.value.filter(tag => tag.type === 'INVOICE')
  })

  const isCacheValid = computed(() => {
    if (!lastFetched.value) return false
    return Date.now() - lastFetched.value < CACHE_EXPIRATION_MS
  })

  // Actions
  async function fetchTags(type: TagType = 'INVOICE', forceRefresh = false): Promise<Tag[]> {
    // Return cached tags if valid and not forcing refresh
    if (!forceRefresh && isCacheValid.value && tags.value.length > 0) {
      return tags.value.filter(tag => tag.type === type)
    }

    loading.value = true
    error.value = null

    try {
      const response = await tagApi.listTags({
        type,
        limit: 100 // Fetch all tags
      })

      // Update cache
      tags.value = response.tags.map(tag => ({
        ...tag,
        color: tag.color || undefined
      }))
      lastFetched.value = Date.now()

      return tags.value.filter(tag => tag.type === type)
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al cargar las etiquetas'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getTags(type: TagType = 'INVOICE', forceRefresh = false): Promise<Tag[]> {
    // If cache is valid and we have tags, return cached
    if (!forceRefresh && isCacheValid.value && tags.value.length > 0) {
      return tags.value.filter(tag => tag.type === type)
    }

    // Otherwise fetch from API
    return await fetchTags(type, forceRefresh)
  }

  async function assignTagToInvoice(invoiceId: string, tagId: string): Promise<void> {
    try {
      await tagApi.assignTagToInvoice(invoiceId, { tagId })
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Error al asignar la etiqueta a la factura'
      error.value = errorMessage
      throw err
    }
  }

  function clearCache() {
    tags.value = []
    lastFetched.value = null
    error.value = null
  }

  return {
    // State
    tags,
    invoiceTags,
    loading,
    error,
    lastFetched,
    isCacheValid,

    // Actions
    fetchTags,
    getTags,
    assignTagToInvoice,
    clearCache
  }
}, {
  persist: {
    key: 'tags-store',
    storage: localStorage,
    pick: ['tags', 'lastFetched']
  }
})

