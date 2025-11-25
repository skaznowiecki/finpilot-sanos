<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 class="mb-6 text-center text-2xl font-bold">Registrarse</h1>

      <RegisterForm />

      <div class="mt-4 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
          ¿Ya tienes una cuenta? Inicia Sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/features/auth/components/RegisterForm.vue'
</script>
