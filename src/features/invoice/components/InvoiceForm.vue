<template>
    <form @submit.prevent="handleSubmit" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Número de Factura -->
            <div class="space-y-3">
                <Label for="number" class="text-base font-medium">Número de Factura</Label>
                <Input id="number" v-model="formData.number" type="number" placeholder="Ej: 8507" required
                    class="h-12 text-lg" />
            </div>

            <!-- Fecha -->
            <div class="space-y-3">
                <Label for="date" class="text-base font-medium">Fecha</Label>
                <Input id="date" v-model="formData.date" type="date" required class="h-12 text-lg" />
            </div>

            <!-- Monto -->
            <div class="space-y-3">
                <Label for="amount" class="text-base font-medium">Monto</Label>
                <Input id="amount" v-model="formData.amount" type="number" step="0.01" placeholder="0.00" required
                    class="h-12 text-lg" />
            </div>

            <!-- Descripción -->
            <div class="space-y-3">
                <Label for="description" class="text-base font-medium">Descripción (Opcional)</Label>
                <Input id="description" v-model="formData.description" placeholder="Ej: Servicios profesionales"
                    class="h-12 text-lg" />
            </div>

            <!-- Unidades de negocios -->
            <div class="space-y-3">
                <Label for="tagId" class="text-base font-medium">Unidades de negocios *</Label>
                <Select v-model="selectedTagId" :disabled="isLoadingTags">
                    <SelectTrigger class="h-12 text-lg">
                        <SelectValue placeholder="Selecciona una unidad de negocio" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="tag in tags" :key="tag.id" :value="tag.id">
                            {{ tag.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-6 pt-8">
            <Button type="button" variant="outline" @click="handleCancel" :disabled="isCreating"
                class="px-8 py-3 text-lg cursor-pointer">
                Cancelar
            </Button>
            <Button type="submit" :disabled="isCreating || !canSubmit"
                class="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 text-lg cursor-pointer">
                <svg v-if="isCreating" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ isCreating ? 'Creando...' : 'Confirmar Factura' }}
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTagsStore } from '@/features/tags/stores/tags.store'
import type { Tag } from '@/features/tags/types'

interface FormData {
    number: number
    date: string
    amount: number
    description: string
    selectedTagId?: string
}

interface Props {
    formData: FormData
    isCreating: boolean
}

interface Emits {
    (e: 'submit', data: FormData): void
    (e: 'cancel'): void
    (e: 'update:formData', data: FormData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tagsStore = useTagsStore()
const tags = ref<Tag[]>([])
const isLoadingTags = ref(false)

// Computed for selectedTagId with getter/setter to sync with parent formData
const selectedTagId = computed({
    get: () => props.formData.selectedTagId,
    set: (value: string | undefined) => {
        // Update parent formData by emitting update event
        emit('update:formData', { ...props.formData, selectedTagId: value })
    }
})

// Load tags on mount
onMounted(async () => {
    isLoadingTags.value = true
    try {
        tags.value = await tagsStore.getTags('INVOICE')
    } catch (error) {
        console.error('Error loading tags:', error)
    } finally {
        isLoadingTags.value = false
    }
})

const canSubmit = computed(() => {
    return (
        props.formData.number > 0 &&
        props.formData.date &&
        props.formData.amount > 0 &&
        !!props.formData.selectedTagId
    )
})

const handleSubmit = () => {
    emit('submit', props.formData)
}

const handleCancel = () => {
    emit('cancel')
}
</script>
