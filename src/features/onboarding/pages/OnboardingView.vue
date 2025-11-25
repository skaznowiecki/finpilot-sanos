<template>
  <div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">Bienvenido a FinPilot</h1>
        <p class="text-lg text-gray-600">
          Completa tu información para comenzar a usar la plataforma
        </p>
      </div>

      <!-- Main content card -->
      <div class="bg-white rounded-xl shadow-lg p-8">
        <form @submit.prevent="onboarding.handleSubmit" class="space-y-6">
          <!-- Name Field -->
          <div class="space-y-2">
            <Label for="name" class="text-sm font-medium text-gray-700">
              Nombre completo *
            </Label>
            <Input id="name" :model-value="onboarding.name.value"
              @update:model-value="(value: string | number) => onboarding.updateName(String(value))"
              placeholder="Ej: Juan Pérez" class="w-full" required />
          </div>

          <!-- Tax ID Type and Number -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tax ID Type -->
            <div class="space-y-2">
              <Label class="text-sm font-medium text-gray-700">
                Tipo de identificación *
              </Label>
              <Select :model-value="onboarding.taxIdType.value" @update:model-value="onboarding.updateTaxIdType">
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

            <!-- Tax ID Number -->
            <div class="space-y-2">
              <Label for="taxId" class="text-sm font-medium text-gray-700">
                Número de identificación *
              </Label>
              <Input id="taxId" :model-value="onboarding.taxId.value"
                @update:model-value="(value: string | number) => onboarding.updateTaxId(String(value))"
                @keydown="(e: KeyboardEvent) => { if (e.key === '-' || e.key === '–' || e.key === '—') e.preventDefault(); }"
                placeholder="Sin puntos ni guiones" class="w-full" type="text" inputmode="numeric" pattern="[0-9]*"
                required />
              <p class="text-xs text-gray-500 mt-1">Ingresa solo números sin guiones</p>
            </div>
          </div>

          <!-- Tax Regimen -->
          <div class="space-y-3">
            <Label class="text-sm font-medium text-gray-700">
              Régimen fiscal *
            </Label>
            <RadioGroup :model-value="onboarding.regimen.value"
              @update:model-value="(value: string) => onboarding.updateRegimen(value as RegimenType)">
              <div class="grid grid-cols-1 gap-3">
                <div v-for="option in REGIMEN_TYPE_OPTIONS" :key="option.value"
                  class="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <RadioGroupItem :value="option.value" :id="`regimen-${option.value}`" />
                  <Label :for="`regimen-${option.value}`" class="grow cursor-pointer">
                    <div class="font-medium">{{ option.label }}</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>


          <!-- Error message -->
          <div v-if="onboarding.error.value" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-600">{{ onboarding.error.value }}</p>
          </div>

          <!-- Submit button -->
          <Button type="submit" class="w-full cursor-pointer" :disabled="!onboarding.canSubmit.value" size="lg">
            <span v-if="onboarding.isSubmitting.value">Completando registro...</span>
            <span v-else>Completar registro</span>
          </Button>
        </form>

        <!-- Logout button -->
        <div class="mt-4">
          <Button
            type="button"
            variant="ghost"
            class="w-full text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
            @click="handleLogout"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { usePartyOnboarding } from '../composables/usePartyOnboarding'
import { TAX_ID_TYPE_OPTIONS, REGIMEN_TYPE_OPTIONS, type RegimenType } from '../types'
import { useAuthStore } from '@/features/auth/stores/auth.store'

// Initialize the onboarding composable
const onboarding = usePartyOnboarding()
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>
