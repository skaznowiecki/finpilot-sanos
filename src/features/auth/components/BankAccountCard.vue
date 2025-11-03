<template>
    <div class="border rounded-lg p-3">
        <div v-if="!editing" class="flex items-center justify-between gap-4">
            <div class="flex-1 grid grid-cols-3 gap-4 text-sm items-center">
                <div>
                    <label class="text-xs text-muted-foreground">CBU</label>
                    <p class="text-sm font-medium">{{ account.accountNumber || 'No proporcionado' }}</p>
                </div>
                <div>
                    <label class="text-xs text-muted-foreground">Banco</label>
                    <p class="text-sm font-medium">{{ account.bankName || 'No proporcionado' }}</p>
                </div>
                <div class="flex items-center">
                    <span v-if="account.isPrimary" class="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Principal
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" @click="handleEdit" class="cursor-pointer">
                    Editar
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    @click="handleDelete"
                    :disabled="!canDelete"
                    class="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                    Eliminar
                </Button>
            </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <Label for="cbu" class="text-sm">CBU *</Label>
                    <Input id="cbu" v-model="formData.accountNumber"
                        placeholder="Ingresa el CBU" required class="h-9" />
                </div>
                <div class="space-y-1">
                    <Label for="bankName" class="text-sm">Nombre del Banco *</Label>
                    <Input id="bankName" v-model="formData.bankName" placeholder="Nombre del banco" required class="h-9" />
                </div>
            </div>
            <div class="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="isPrimary" 
                    :checked="formData.isPrimary"
                    @change="handlePrimaryChange(($event.target as HTMLInputElement).checked)"
                    class="rounded border-gray-300" />
                <Label for="isPrimary" class="cursor-pointer text-sm">Cuenta Principal</Label>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" variant="outline" @click="handleCancel" size="sm" class="cursor-pointer">
                    Cancelar
                </Button>
                <Button type="submit" :disabled="saving" size="sm" class="cursor-pointer">
                    Guardar
                </Button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BankAccount, UpdateBankAccountRequest } from '../types'

interface Props {
    account: BankAccount
    saving?: boolean
    canDelete?: boolean
}

interface Emits {
    (e: 'update', data: UpdateBankAccountRequest): void
    (e: 'delete'): void
    (e: 'primary-change', isPrimary: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
    saving: false,
    canDelete: true
})

const emit = defineEmits<Emits>()

const editing = ref(false)
const formData = reactive<UpdateBankAccountRequest>({
    bankName: null,
    accountNumber: null,
    isPrimary: false
})

// Initialize form data from account
watch(() => props.account, (account) => {
    formData.bankName = account.bankName || null
    formData.accountNumber = account.accountNumber || null
    formData.isPrimary = account.isPrimary || false
}, { immediate: true })

const handleEdit = () => {
    editing.value = true
}

const handleCancel = () => {
    // Reset form data
    formData.bankName = props.account.bankName || null
    formData.accountNumber = props.account.accountNumber || null
    formData.isPrimary = props.account.isPrimary || false
    editing.value = false
}

const handlePrimaryChange = (isPrimary: boolean) => {
    formData.isPrimary = isPrimary
    emit('primary-change', isPrimary)
}

const handleSubmit = () => {
    emit('update', { ...formData })
    editing.value = false
}

const handleDelete = () => {
    emit('delete')
}
</script>
