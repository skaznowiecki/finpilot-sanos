import type { RouteRecordRaw } from 'vue-router'
import { authGuard } from '@/shared/guards/auth.guard'
import { onboardingGuard } from '@/router/guards'

export const invoiceRoutes: RouteRecordRaw[] = [
    {
        path: '/invoices',
        name: 'Invoices',
        component: () => import('./pages/HomeView.vue'),
        beforeEnter: [authGuard, onboardingGuard]
    },
    {
        path: '/invoices/upload',
        name: 'InvoiceUpload',
        component: () => import('./pages/UploadView.vue'),
        beforeEnter: [authGuard, onboardingGuard]
    },
    {
        path: '/invoices/:id',
        name: 'InvoiceDetail',
        component: () => import('./pages/DetailView.vue'),
        beforeEnter: [authGuard, onboardingGuard]
    }
]
