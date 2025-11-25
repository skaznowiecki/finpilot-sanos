<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
        <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
            <h1 class="mb-6 text-center text-2xl font-bold">Recuperar Contraseña</h1>

            <div v-if="success" class="text-center">
                <div class="mb-4 text-green-600">
                    <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p class="mt-2 text-lg font-medium">Correo enviado</p>
                </div>
                <p class="text-gray-600 mb-6">
                    Si existe una cuenta asociada a {{ email }}, recibirás un código de recuperación.
                </p>
                <button @click="goToResetPassword"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    Ingresar Código
                </button>
            </div>

            <form v-else @submit.prevent="handleSubmit" class="space-y-4">
                <p class="text-sm text-gray-600 text-center mb-4">
                    Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
                </p>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                    <input v-model="email" type="email"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        :class="{ 'border-red-500': error }" placeholder="ejemplo@correo.com" />
                </div>

                <div v-if="error" class="text-red-500 text-sm text-center">
                    {{ error }}
                </div>

                <button type="submit" :disabled="isLoading"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer">
                    <span v-if="isLoading">Enviando...</span>
                    <span v-else>Enviar Código</span>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleSubmit = async () => {
    error.value = ''

    if (!email.value) {
        error.value = 'El correo electrónico es obligatorio'
        return
    }

    if (!validateEmail(email.value)) {
        error.value = 'El formato del correo electrónico no es válido'
        return
    }

    isLoading.value = true

    try {
        await authStore.requestPasswordReset(email.value)
        success.value = true
    } catch (e: unknown) {
        console.error(e)
        // Even if it fails (e.g. email not found), for security we might want to show success or a generic message.
        // But if it's a server error, we should show it.
        const err = e as { response?: { data?: { message?: string } } }
        if (err.response?.data?.message) {
            error.value = err.response.data.message
        } else {
            error.value = 'Ocurrió un error al enviar el correo'
        }
    } finally {
        isLoading.value = false
    }
}

const goToResetPassword = () => {
    router.push({ name: 'ResetPassword', query: { email: email.value } })
}
</script>
