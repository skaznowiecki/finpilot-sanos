<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
        <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
            <h1 class="mb-6 text-center text-2xl font-bold">Login</h1>
            <div class="flex justify-center">
                <div class="text-center">
                    <div class="mb-4 text-lg">Redirecting to Auth0...</div>
                    <div
                        class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'

const { loginWithRedirect, isAuthenticated } = useAuth0()
const router = useRouter()

onMounted(() => {
    if (isAuthenticated.value) {
        router.push({ name: 'Home' })
    } else {
        // Auto-redirect to Auth0 login
        loginWithRedirect()
    }
})
</script>
