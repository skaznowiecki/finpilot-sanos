<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700" for="name-input">Nombre</label>
      <input id="name-input" v-model="form.name" type="text" tabindex="1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        :class="{ 'border-red-500': errors.name }" />
      <span v-if="errors.name" class="text-red-500 text-xs">{{ errors.name }}</span>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700" for="email-input">Correo Electrónico</label>
      <input id="email-input" v-model="form.email" type="email" tabindex="2"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        :class="{ 'border-red-500': errors.email }" />
      <span v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</span>
    </div>

    <PasswordStrengthInput v-model:password="form.password" v-model:confirmPassword="form.confirmPassword"
      :showConfirm="true" :showStrength="true" :error="errors.password" id="password-input"
      @update:valid="isPasswordValid = $event" />

    <div v-if="error" class="text-red-500 text-sm text-center">
      {{ error }}
    </div>

    <button type="submit" tabindex="5" :disabled="isLoading || !isPasswordValid"
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer">
      <span v-if="isLoading">Cargando...</span>
      <span v-else>Registrarse</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import PasswordStrengthInput from '@/features/auth/components/PasswordStrengthInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')
const isPasswordValid = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: ''
})

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validate = () => {
  let isValid = true
  errors.name = ''
  errors.email = ''
  errors.password = ''

  if (!form.name) {
    errors.name = 'El nombre es obligatorio'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'El correo electrónico es obligatorio'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = 'El formato del correo electrónico no es válido'
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
    await authStore.register({
      email: form.email,
      password: form.password,
      name: form.name,
      type: 'PARTY'
    })

    // Redirect based on onboarding status
    if (authStore.isOnboarded) {
      router.push({ name: 'Home' })
    } else {
      router.push({ name: 'Onboarding' })
    }
  } catch (e: unknown) {
    console.error(e)
    const err = e as { response?: { data?: { message?: string } } }
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Ocurrió un error al registrarse'
    }

    isLoading.value = false
  }
}
</script>
