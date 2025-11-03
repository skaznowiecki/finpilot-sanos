import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

// Enhanced guard to check if user has completed onboarding
export const onboardingGuard = async (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const { idTokenClaims } = useAuth0()

    // Read onboarded status from namespaced app_metadata
    const appMetadata = idTokenClaims.value?.[`${import.meta.env.VITE_AUTH0_AUDIENCE}/app_metadata`] || {}

    if (appMetadata.onboarded !== true) {
        return next({ name: 'Onboarding' })
    }

    next()
}

// Guard for the onboarding page to prevent accessing it if already completed
export const preventIfOnboarded = async (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const { idTokenClaims } = useAuth0()

    // Read onboarded status from namespaced app_metadata
    const appMetadata = idTokenClaims.value?.[`${import.meta.env.VITE_AUTH0_AUDIENCE}/app_metadata`] || {}

    if (appMetadata.onboarded === true) {
        return next({ name: 'Home' })
    }

    next()
}
