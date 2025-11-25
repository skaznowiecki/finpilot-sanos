import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useRouter } from 'vue-router'

export function useAuthActions() {
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogout = () => {
        authStore.logout()
        router.push({ name: 'Login' })
    }

    const navigateToSettings = () => {
        router.push({ name: 'Settings' })
    }

    return {
        handleLogout,
        navigateToSettings
    }
}
