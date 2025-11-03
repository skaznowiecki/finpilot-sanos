import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'

export function useAuthActions() {
    const { logout } = useAuth0()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            })
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const navigateToSettings = () => {
        router.push({ name: 'Settings' })
    }

    return {
        handleLogout,
        navigateToSettings
    }
}
