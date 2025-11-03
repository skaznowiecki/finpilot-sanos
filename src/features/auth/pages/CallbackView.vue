<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
        <div class="text-center">
            <div class="mb-4 text-xl font-semibold">Logging you in...</div>
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const router = useRouter()
const { isAuthenticated, isLoading } = useAuth0()

onMounted(() => {
    // Wait for Auth0 to complete authentication
    const checkAuth = setInterval(() => {
        if (!isLoading.value) {
            clearInterval(checkAuth)

            if (isAuthenticated.value) {
                // Successfully authenticated, redirect to home
                router.replace('/')
            } else {
                // Failed authentication, redirect to login
                router.replace('/login')
            }
        }
    }, 100)
})
</script>
