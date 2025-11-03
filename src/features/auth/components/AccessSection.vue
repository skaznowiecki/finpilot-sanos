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
                        <div>
                            <Label for="password" class="sr-only">Contraseña</Label>
                            <div class="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    v-model="password"
                                    required
                                    placeholder="Nueva contraseña"
                                    :class="{ 'border-red-500': passwordError }"
                                />
                                <button
                                    type="button"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    @click="showPassword = !showPassword"
                                >
                                    <Eye v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                                    <EyeOff v-else class="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <div v-if="passwordError" class="mt-1 text-sm text-red-600">
                                {{ passwordError }}
                            </div>
                        </div>

                        <div>
                            <Label for="confirmPassword" class="sr-only">Confirmar Contraseña</Label>
                            <div class="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    :type="showConfirmPassword ? 'text' : 'password'"
                                    v-model="confirmPassword"
                                    required
                                    placeholder="Confirmar contraseña"
                                    :class="{ 'border-red-500': confirmPasswordError }"
                                />
                                <button
                                    type="button"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    @click="showConfirmPassword = !showConfirmPassword"
                                >
                                    <Eye v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" />
                                    <EyeOff v-else class="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <div v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">
                                {{ confirmPasswordError }}
                            </div>
                        </div>

                        <!-- Password Requirements -->
                        <div class="text-sm text-gray-600">
                            <p class="font-medium mb-2">Requisitos de contraseña:</p>
                            <ul class="space-y-1">
                                <li class="flex items-center" :class="{ 'text-green-600': hasMinLength }">
                                    <Check v-if="hasMinLength" class="h-4 w-4 mr-2" />
                                    <X v-else class="h-4 w-4 mr-2 text-red-500" />
                                    Al menos 8 caracteres
                                </li>
                                <li class="flex items-center" :class="{ 'text-green-600': hasUppercase }">
                                    <Check v-if="hasUppercase" class="h-4 w-4 mr-2" />
                                    <X v-else class="h-4 w-4 mr-2 text-red-500" />
                                    Al menos una letra mayúscula
                                </li>
                                <li class="flex items-center" :class="{ 'text-green-600': hasLowercase }">
                                    <Check v-if="hasLowercase" class="h-4 w-4 mr-2" />
                                    <X v-else class="h-4 w-4 mr-2 text-red-500" />
                                    Al menos una letra minúscula
                                </li>
                                <li class="flex items-center" :class="{ 'text-green-600': hasNumber }">
                                    <Check v-if="hasNumber" class="h-4 w-4 mr-2" />
                                    <X v-else class="h-4 w-4 mr-2 text-red-500" />
                                    Al menos un número
                                </li>
                                <li class="flex items-center" :class="{ 'text-green-600': hasSpecialChar }">
                                    <Check v-if="hasSpecialChar" class="h-4 w-4 mr-2" />
                                    <X v-else class="h-4 w-4 mr-2 text-red-500" />
                                    Al menos un carácter especial
                                </li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            :disabled="!isPasswordValid || isLoading"
                            class="w-full cursor-pointer"
                        >
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
import { Eye, EyeOff, Check, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
    email?: string | null
}

interface Emits {
    (e: 'change-password', password: string, confirmPassword: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Password validation
const hasMinLength = computed(() => password.value.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(password.value))
const hasLowercase = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /[0-9]/.test(password.value))
const hasSpecialChar = computed(() => /[^A-Za-z0-9]/.test(password.value))

const isPasswordValid = computed(() => {
  return hasMinLength.value && 
         hasUppercase.value && 
         hasLowercase.value && 
         hasNumber.value && 
         hasSpecialChar.value &&
         password.value === confirmPassword.value
})

const passwordError = computed(() => {
  if (!password.value) return ''
  if (!hasMinLength.value) return 'La contraseña debe tener al menos 8 caracteres'
  if (!hasUppercase.value) return 'La contraseña debe contener al menos una letra mayúscula'
  if (!hasLowercase.value) return 'La contraseña debe contener al menos una letra minúscula'
  if (!hasNumber.value) return 'La contraseña debe contener al menos un número'
  if (!hasSpecialChar.value) return 'La contraseña debe contener al menos un carácter especial'
  return ''
})

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return ''
  if (password.value !== confirmPassword.value) return 'Las contraseñas no coinciden'
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
  } catch (err) {
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
