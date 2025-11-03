import type { RouteRecordRaw } from 'vue-router'
import { authGuard } from '@/shared/guards/auth.guard'
import { onboardingGuard } from '@/router/guards'

export const authRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        redirect: '/invoices'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('./pages/LoginView.vue'),
        meta: { public: true }
    },
    {
        path: '/callback',
        name: 'Callback',
        component: () => import('./pages/CallbackView.vue'),
        meta: { public: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('./pages/SettingsView.vue'),
        beforeEnter: [authGuard, onboardingGuard]
    }
]
