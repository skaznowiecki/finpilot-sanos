import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export const authGuard = (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
        return next({ name: 'Login' })
    }
    next()
}

export const onboardingGuard = (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore()

    if (!authStore.isOnboarded) {
        return next({ name: 'Onboarding' })
    }

    next()
}

export const preventIfOnboarded = (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore()

    if (authStore.isOnboarded) {
        return next({ name: 'Home' })
    }

    next()
}
