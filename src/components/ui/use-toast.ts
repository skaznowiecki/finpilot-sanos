import { ref, readonly } from 'vue'

export interface Toast {
    id: string
    title?: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    variant?: 'default' | 'destructive'
}

interface ToastOptions {
    title?: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    variant?: 'default' | 'destructive'
}

// Create a global reactive toast array
const toasts = ref<Toast[]>([])

/**
 * Create a toast notification
 */
export function toast(options: ToastOptions) {
    const id = Math.random().toString(36).slice(2, 11)

    const newToast: Toast = {
        id,
        title: options.title,
        description: options.description,
        action: options.action,
        variant: options.variant || 'default'
    }

    toasts.value = [...toasts.value, newToast]

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        dismissToast(id)
    }, 5000)

    return {
        id,
        dismiss: () => dismissToast(id),
        update: (options: ToastOptions) => updateToast(id, options)
    }
}

/**
 * Dismiss a toast by ID
 */
function dismissToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
}

/**
 * Update a toast by ID
 */
function updateToast(id: string, options: ToastOptions) {
    toasts.value = toasts.value.map(t => {
        if (t.id === id) {
            return {
                ...t,
                ...options
            }
        }
        return t
    })
}

export function useToast() {
    return {
        toasts: readonly(toasts),
        toast,
        dismiss: dismissToast
    }
} 