<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input v-model="form.email" type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                :class="{ 'border-red-500': errors.email }" />
            <span v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</span>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input v-model="form.password" type="password"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                :class="{ 'border-red-500': errors.password }" />
            <span v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</span>
        </div>

        <div class="flex justify-end">
            <router-link to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
                ¿Olvidaste tu contraseña?
            </router-link>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
            {{ error }}
        </div>

        <button type="submit" :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer">
            <span v-if="isLoading">Cargando...</span>
            <span v-else>Iniciar Sesión</span>
        </button>
    </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

const form = reactive({
    email: '',
    password: ''
})

const errors = reactive({
    email: '',
    password: ''
})

const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validate = () => {
    let isValid = true
    errors.email = ''
    errors.password = ''

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

    return isValid
}

const handleSubmit = async () => {
    error.value = ''

    if (!validate()) {
        return
    }

    isLoading.value = true

    try {
        await authStore.login({
            email: form.email,
            password: form.password
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
            error.value = 'Ocurrió un error al iniciar sesión'
        }

        isLoading.value = false
    }
}
</script>
