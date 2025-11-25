import type { RouteRecordRaw } from 'vue-router'
import { authGuard, onboardingGuard } from '@/router/guards'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/invoices'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/pages/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/features/auth/pages/RegisterView.vue'),
    meta: { public: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/features/auth/pages/ForgotPasswordView.vue'),
    meta: { public: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/features/auth/pages/ResetPasswordView.vue'),
    meta: { public: true }
  },

  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/features/auth/pages/SettingsView.vue'),
    beforeEnter: [authGuard, onboardingGuard]
  }
]
