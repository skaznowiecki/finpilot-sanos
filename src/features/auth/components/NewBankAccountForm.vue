<template>
    <div class="mb-6 border rounded-lg p-4 bg-accent/50">
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Nueva Cuenta Bancaria</h3>
            <Button variant="ghost" size="sm" @click="handleCancel" class="cursor-pointer">
                Cancelar
            </Button>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="newCBU">CBU *</Label>
                    <Input id="newCBU" v-model="form.accountNumber" placeholder="Ingresa el CBU" required />
                </div>
                <div class="space-y-2">
                    <Label for="newBankName">Nombre del Banco *</Label>
                    <Input id="newBankName" v-model="form.bankName" placeholder="Nombre del banco" required />
                </div>
            </div>
            <div class="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="newIsPrimary" 
                    :checked="form.isPrimary"
                    @change="handlePrimaryChange(($event.target as HTMLInputElement).checked)"
                    class="rounded border-gray-300" />
                <Label for="newIsPrimary" class="cursor-pointer">Cuenta Principal</Label>
            </div>
            <div class="flex justify-end gap-3">
                <Button type="button" variant="outline" @click="handleCancel" size="sm" class="cursor-pointer">
                    Cancelar
                </Button>
                <Button type="submit" :disabled="saving" size="sm" class="cursor-pointer">
                    Crear Cuenta
                </Button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateBankAccountRequest } from '../types'

interface Props {
    saving?: boolean
}

interface Emits {
    (e: 'submit', data: CreateBankAccountRequest): void
    (e: 'cancel'): void
    (e: 'primary-change', isPrimary: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
    saving: false
})

const emit = defineEmits<Emits>()

const form = reactive<CreateBankAccountRequest>({
    bankName: null,
    accountNumber: null,
    isPrimary: false
})

const handlePrimaryChange = (isPrimary: boolean) => {
    form.isPrimary = isPrimary
    emit('primary-change', isPrimary)
}

const handleSubmit = () => {
    emit('submit', { ...form })
}

const handleCancel = () => {
    Object.assign(form, {
        bankName: null,
        accountNumber: null,
        isPrimary: false
    })
    emit('cancel')
}

// Expose reset method for parent
defineExpose({
    reset: () => {
        Object.assign(form, {
            bankName: null,
            accountNumber: null,
            isPrimary: false
        })
    }
})
</script>
