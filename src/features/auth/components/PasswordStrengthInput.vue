<template>
    <div class="space-y-4">
        <!-- Password Input -->
        <div>
            <Label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</Label>
            <div class="relative">
                <Input :id="id" :type="showPassword ? 'text' : 'password'" :model-value="password"
                    @update:model-value="$emit('update:password', $event as string)" class="pr-10" tabindex="3"
                    :class="{ 'border-red-500': error }" :placeholder="placeholder" />
                <button type="button" tabindex="-1" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    @click="showPassword = !showPassword">
                    <Eye v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                    <EyeOff v-else class="h-5 w-5 text-gray-400" />
                </button>
            </div>
            <span v-if="error" class="text-red-500 text-xs mt-1 block">{{ error }}</span>

            <!-- Strength Meter & Requirements -->
            <div v-if="showStrength" class="space-y-2 mt-2" tabindex="-1">
                <!-- Progress Bar -->
                <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-300 ease-out" :class="strengthColor"
                        :style="{ width: `${strengthScore}%` }"></div>
                </div>
                <p class="text-xs text-right text-gray-500">{{ strengthLabel }}</p>

                <!-- Requirements List -->
                <div class="text-sm text-gray-600">
                    <p class="font-medium mb-2">Requisitos de contraseña:</p>
                    <ul class="space-y-1">
                        <li class="flex items-center" :class="{ 'text-green-600': hasMinLength }">
                            <Check v-if="hasMinLength" class="h-4 w-4 mr-2" />
                            <X v-else class="h-4 w-4 mr-2 text-red-500" />
                            Al menos 8 caracteres
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Confirm Password Input -->
        <div v-if="showConfirm">
            <Label :for="`${id}-confirm`" class="block text-sm font-medium text-gray-700 mb-1">Confirmar
                Contraseña</Label>
            <div class="relative">
                <Input :id="`${id}-confirm`" :type="showConfirmPassword ? 'text' : 'password'"
                    :model-value="confirmPassword"
                    @update:model-value="$emit('update:confirmPassword', $event as string)" class="pr-10" tabindex="4"
                    :class="{ 'border-red-500': confirmError }" placeholder="Confirmar contraseña" />
                <button type="button" tabindex="-1" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword">
                    <Eye v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" />
                    <EyeOff v-else class="h-5 w-5 text-gray-400" />
                </button>
            </div>
            <span v-if="confirmError" class="text-red-500 text-xs mt-1 block">{{ confirmError }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye, EyeOff, Check, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
    password?: string
    confirmPassword?: string
    showConfirm?: boolean
    showStrength?: boolean
    label?: string
    id?: string
    placeholder?: string
    error?: string
}

interface Emits {
    (e: 'update:password', value: string): void
    (e: 'update:confirmPassword', value: string): void
    (e: 'update:valid', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
    password: '',
    confirmPassword: '',
    showConfirm: false,
    showStrength: false,
    label: 'Contraseña',
    id: 'password-input',
    placeholder: '',
    error: ''
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Strength Validation
const hasMinLength = computed(() => props.password.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(props.password))
const hasLowercase = computed(() => /[a-z]/.test(props.password))
const hasNumber = computed(() => /[0-9]/.test(props.password))
const hasSpecialChar = computed(() => /[^A-Za-z0-9]/.test(props.password))

// Strength Score (0-100)
const strengthScore = computed(() => {
    let score = 0
    if (hasMinLength.value) score += 20
    if (hasUppercase.value) score += 20
    if (hasLowercase.value) score += 20
    if (hasNumber.value) score += 20
    if (hasSpecialChar.value) score += 20
    return score
})

const strengthColor = computed(() => {
    if (strengthScore.value <= 20) return 'bg-red-500'
    if (strengthScore.value <= 40) return 'bg-orange-500'
    if (strengthScore.value <= 60) return 'bg-yellow-500'
    if (strengthScore.value <= 80) return 'bg-blue-500'
    return 'bg-green-500'
})

const strengthLabel = computed(() => {
    if (strengthScore.value === 0) return ''
    if (strengthScore.value <= 20) return 'Muy débil'
    if (strengthScore.value <= 40) return 'Débil'
    if (strengthScore.value <= 60) return 'Regular'
    if (strengthScore.value <= 80) return 'Buena'
    return 'Fuerte'
})

// Validation Logic
const isValid = computed(() => {
    // Basic requirement: Min 8 chars
    if (!hasMinLength.value) return false

    // If confirm is shown, passwords must match
    if (props.showConfirm && props.password !== props.confirmPassword) return false

    return true
})

const confirmError = computed(() => {
    if (!props.showConfirm || !props.confirmPassword) return ''
    if (props.password !== props.confirmPassword) return 'Las contraseñas no coinciden'
    return ''
})

// Watch for validity changes
watch(isValid, (newVal) => {
    emit('update:valid', newVal)
}, { immediate: true })

</script>
