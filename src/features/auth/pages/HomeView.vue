<template>
    <div class="min-h-screen bg-background">
        <div class="container mx-auto py-8">
            <div class="max-w-2xl mx-auto">
                <div class="bg-white rounded-lg shadow-md p-8">
                    <h1 class="text-3xl font-bold text-center mb-8">Welcome!</h1>

                    <div v-if="user" class="text-center">
                        <div v-if="user.picture" class="mb-4">
                            <img :src="user.picture" :alt="user.name"
                                class="w-24 h-24 rounded-full mx-auto border-4 border-gray-200" />
                        </div>

                        <h2 class="text-2xl font-semibold mb-2">{{ user.name }}</h2>
                        <p class="text-gray-600 mb-4">{{ user.email }}</p>

                        <div class="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 class="font-semibold mb-2">User Information:</h3>
                            <div class="text-sm text-gray-600">
                                <p><strong>User ID:</strong> {{ user.sub }}</p>
                                <p><strong>Email Verified:</strong> {{ user.email_verified ? 'Yes' : 'No' }}</p>
                            </div>
                        </div>

                        <button @click="logout"
                            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
                            Logout
                        </button>
                    </div>

                    <div v-else class="text-center">
                        <div
                            class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4">
                        </div>
                        <p>Loading user information...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
// import type { User } from '../types'

const { user, logout: auth0Logout } = useAuth0()

const logout = () => {
    auth0Logout({
        logoutParams: {
            returnTo: window.location.origin + '/login'
        }
    })
}
</script>
