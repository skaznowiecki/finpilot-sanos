<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 class="mb-6 text-center text-2xl font-bold">Restablecer Contraseña</h1>

      <div v-if="success" class="text-center">
        <div class="mb-4 text-green-600">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="mt-2 text-lg font-medium">Contraseña actualizada</p>
        </div>
        <p class="text-gray-600 mb-6">
          Tu contraseña ha sido restablecida exitosamente.
        </p>
        <router-link to="/login"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Iniciar Sesión
        </router-link>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Código de Verificación</label>
          <input v-model="form.code" type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            :class="{ 'border-red-500': errors.code }" placeholder="Código de 6 dígitos" maxlength="6" />
          <span v-if="errors.code" class="text-red-500 text-xs">{{ errors.code }}</span>
        </div>

        <PasswordStrengthInput v-model:password="form.password" v-model:confirmPassword="form.confirmPassword"
          :showConfirm="true" :showStrength="true" :error="errors.password" @update:valid="isPasswordValid = $event"
          label="Nueva Contraseña" />

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading || !isPasswordValid"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer">
          <span v-if="isLoading">Restableciendo...</span>
          <span v-else>Restablecer Contraseña</span>
        </button>

        <div class="mt-4 text-center">
          <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
            Volver al inicio de sesión
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import PasswordStrengthInput from '@/features/auth/components/PasswordStrengthInput.vue'

const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')
const success = ref(false)
const isPasswordValid = ref(false)

const form = reactive({
  code: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  code: '',
  password: '',
  confirmPassword: ''
})

const validate = () => {
  let isValid = true
  errors.code = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.code) {
    errors.code = 'El código es obligatorio'
    isValid = false
  } else if (!/^\d{6}$/.test(form.code)) {
    errors.code = 'El código debe ser de 6 dígitos'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'La contraseña es obligatoria'
    isValid = false
  }

  if (!isPasswordValid.value) {
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  error.value = ''

  if (!validate()) {
    return
  }

  isLoading.value = true

  try {
    await authStore.resetPassword({
      code: form.code,
      password: form.password
    })
    success.value = true
  } catch (e: unknown) {
    console.error(e)
    const err = e as { response?: { data?: { message?: string } } }
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Ocurrió un error al restablecer la contraseña'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
