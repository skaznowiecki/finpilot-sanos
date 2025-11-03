import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/features/auth/routes'
import { invoiceRoutes } from '@/features/invoice/routes'
import { useAuth0 } from '@auth0/auth0-vue'
import { onboardingGuard, preventIfOnboarded } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...invoiceRoutes,
    {
      path: '/onboarding',
      name: 'Onboarding',
      component: () => import('@/features/onboarding/pages/OnboardingView.vue'),
      beforeEnter: [preventIfOnboarded]
    }
  ],
})

// Global navigation guard to handle initial authentication routing
router.beforeEach((to, _from, next) => {
  const { isAuthenticated, isLoading } = useAuth0()

  // Skip for public routes and callback route
  if (to.meta.public || to.name === 'Callback') {
    next()
    return
  }

  // Skip onboarding route from global guard - it has its own guard
  if (to.name === 'Onboarding') {
    next()
    return
  }

  // If Auth0 is still loading, wait for it to finish
  if (isLoading.value) {
    const checkAuth = setInterval(() => {
      if (!isLoading.value) {
        clearInterval(checkAuth)

        if (isAuthenticated.value) {
          // User is authenticated, allow navigation (onboarding check is handled by route guards)
          next()
        } else {
          // User is not authenticated, redirect to login
          next({ name: 'Login' })
        }
      }
    }, 50)
    return
  }

  // Auth0 has finished loading
  if (isAuthenticated.value) {
    // User is authenticated, allow navigation (onboarding check is handled by route guards)
    next()
  } else {
    next({ name: 'Login' })
  }
})

export default router
