<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 class="mb-6 text-center text-2xl font-bold">Iniciar Sesión</h1>

      <LoginForm />

      <div class="mt-4 text-center">
        <router-link to="/register" class="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
          ¿Necesitas una cuenta? Regístrate
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/features/auth/components/LoginForm.vue'
</script>
