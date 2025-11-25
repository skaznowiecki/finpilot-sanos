import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/features/auth/routes'
import { invoiceRoutes } from '@/features/invoice/routes'
import { preventIfOnboarded, authGuard } from './guards'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...invoiceRoutes,
    {
      path: '/onboarding',
      name: 'Onboarding',
      component: () => import('@/features/onboarding/pages/OnboardingView.vue'),
      beforeEnter: [authGuard, preventIfOnboarded]
    }
  ],
})

// Global navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Skip for public routes
  if (to.meta.public) {
    next()
    return
  }

  if (authStore.isAuthenticated) {
    next()
  } else {
    next({ name: 'Login' })
  }
})

export default router
