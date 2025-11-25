<template>
  <Card>
    <CardHeader>
      <CardTitle>Acceso</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-6">
        <div>
          <Label for="userEmail" class="text-sm font-medium">Email</Label>
          <p class="text-sm mt-1">{{ email || 'No proporcionado' }}</p>
        </div>
        <div>
          <Label class="text-sm font-medium mb-2 block">Contraseña</Label>
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <PasswordStrengthInput v-model:password="password" v-model:confirmPassword="confirmPassword"
              :showConfirm="true" :showStrength="true" :error="passwordError"
              @update:valid="isPasswordValid = $event" />

            <Button type="submit" :disabled="!isPasswordValid || isLoading" class="w-full cursor-pointer">
              {{ isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña' }}
            </Button>

            <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div class="text-sm text-red-600">
                {{ error }}
              </div>
            </div>

            <div v-if="success" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div class="text-sm text-green-600">
                {{ success }}
              </div>
            </div>
          </form>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PasswordStrengthInput from '@/features/auth/components/PasswordStrengthInput.vue'

interface Props {
  email?: string | null
}

interface Emits {
  (e: 'change-password', password: string, confirmPassword: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const isPasswordValid = ref(false)

const passwordError = computed(() => {
  // The component handles internal validation display, but we can pass an external error if needed.
  // Here we mainly rely on the component's internal validation state.
  return ''
})

const handleChangePassword = async () => {
  if (!isPasswordValid.value) return

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    emit('change-password', password.value, confirmPassword.value)
    // Success will be handled by parent component
  } catch {
    // Error will be handled by parent component
  } finally {
    isLoading.value = false
  }
}

// Expose methods for parent to control loading/error/success states
defineExpose({
  setLoading: (loading: boolean) => { isLoading.value = loading },
  setError: (err: string) => { error.value = err },
  setSuccess: (msg: string) => { success.value = msg },
  resetForm: () => {
    password.value = ''
    confirmPassword.value = ''
    error.value = ''
    success.value = ''
  }
})
</script>
