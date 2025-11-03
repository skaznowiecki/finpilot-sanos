<template>
    <Card>
        <CardHeader>
            <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Name - Full Width -->
                <div class="space-y-2">
                    <Label for="name">Nombre *</Label>
                    <Input id="name" v-model="form.name" placeholder="Ingresa tu nombre" required class="w-full" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Tax ID Type -->
                    <div class="space-y-2">
                        <Label for="taxIdType">Tipo de Identificación</Label>
                        <Select v-model="form.taxIdType">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="option in TAX_ID_TYPE_OPTIONS" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Tax ID -->
                    <div class="space-y-2">
                        <Label for="taxId">Número de Identificación</Label>
                        <Input id="taxId" v-model="form.taxId" placeholder="Número de identificación" />
                    </div>
                </div>

                <!-- Regimen - Full Width -->
                <div class="space-y-2">
                    <Label>Régimen Fiscal</Label>
                    <RadioGroup v-model="form.regimen" class="mt-2">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div v-for="option in REGIMEN_TYPE_OPTIONS" :key="option.value"
                                class="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                                <RadioGroupItem :value="option.value" :id="`regimen-${option.value}`" />
                                <Label :for="`regimen-${option.value}`" class="grow cursor-pointer">
                                    {{ option.label }}
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <!-- Address - Full Width -->
                <div class="space-y-2">
                    <Label for="address">Dirección</Label>
                    <Input id="address" v-model="form.address" placeholder="Ingresa tu dirección" class="w-full" />
                </div>

                <div class="flex justify-end gap-3">
                    <Button type="button" variant="outline" @click="handleCancel" :disabled="saving" class="cursor-pointer">
                        Cancelar
                    </Button>
                    <Button type="submit" :disabled="saving || !hasChanges" class="cursor-pointer">
                        <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TAX_ID_TYPE_OPTIONS, REGIMEN_TYPE_OPTIONS } from '@/features/onboarding/types'
import type { RegimenType, TaxIdType } from '@/features/onboarding/types'
import type { Party } from '../types'

interface Props {
    party: Party | null
    saving?: boolean
}

interface Emits {
    (e: 'update', data: { name: string; taxId?: string; taxIdType?: TaxIdType; address?: string; regimen?: RegimenType }): void
    (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
    saving: false
})

const emit = defineEmits<Emits>()

const form = ref({
    name: '',
    taxId: '',
    taxIdType: 'CUIT' as TaxIdType,
    regimen: 'RESPONSABLE_INSCRIPTO' as RegimenType | null,
    address: ''
})

// Initialize form from party data
watch(() => props.party, (party) => {
    if (party) {
        form.value = {
            name: party.name || '',
            taxId: party.taxId || '',
            taxIdType: party.taxIdType || 'CUIT',
            regimen: party.regimen || null,
            address: party.address || ''
        }
    }
}, { immediate: true })

// Check if form has changes
const hasChanges = computed(() => {
    if (!props.party) return false
    const party = props.party
    return (
        form.value.name !== (party.name || '') ||
        form.value.taxId !== (party.taxId || '') ||
        form.value.taxIdType !== (party.taxIdType || 'CUIT') ||
        form.value.address !== (party.address || '') ||
        form.value.regimen !== (party.regimen || null)
    )
})

const handleSubmit = () => {
    emit('update', {
        name: form.value.name,
        taxId: form.value.taxId || undefined,
        taxIdType: form.value.taxIdType || undefined,
        address: form.value.address || undefined,
        regimen: form.value.regimen || undefined
    })
}

const handleCancel = () => {
    if (props.party) {
        const party = props.party
        form.value = {
            name: party.name || '',
            taxId: party.taxId || '',
            taxIdType: party.taxIdType || 'CUIT',
            regimen: party.regimen || null,
            address: party.address || ''
        }
    }
    emit('cancel')
}
</script>
