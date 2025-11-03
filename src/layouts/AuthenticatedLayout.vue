<template>
  <div class="min-h-screen bg-background">
    <!-- Top Navigation Bar -->
    <nav class="bg-background text-foreground px-6 py-4 border-b border-border">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="/sanos.png" alt="SANOS SALUD" class="h-14" />
        </div>

        <!-- User Avatar in Top Right -->
        <div class="relative">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                class="flex items-center space-x-2 hover:bg-accent rounded-lg px-3 py-2 transition-colors cursor-pointer">
                <Avatar class="h-8 w-8">
                  <AvatarImage :src="user?.picture" :alt="user?.name || 'User'" />
                  <AvatarFallback class="bg-primary text-primary-foreground text-sm">
                    {{ getUserInitials(user?.name || user?.email) }}
                  </AvatarFallback>
                </Avatar>
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56" align="end" :side-offset="8">
              <DropdownMenuLabel class="font-normal">
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">{{ user?.name || 'User' }}</p>
                  <p class="text-xs leading-none text-muted-foreground">
                    {{ user?.email }}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="navigateToSettings" class="cursor-pointer">
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem @click="navigateToHome" class="cursor-pointer">
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
                Mis Facturas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-red-600 focus:text-red-600">
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                  </path>
                </svg>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div class="bg-background min-h-screen">
      <!-- Page Header -->
      <div class="px-6 py-8">
        <div class="flex items-center justify-between mb-6">
          <!-- Title Slot -->
          <div class="flex-1">
            <slot name="title">
              <h1 class="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            </slot>
            <slot name="subtitle">
            </slot>
          </div>

          <!-- Actions Slot -->
          <div class="flex items-center gap-2">
            <slot name="actions"></slot>
          </div>
        </div>

        <!-- Main Content -->
        <main>
          <slot></slot>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthActions } from '@/features/auth/composables/useAuthActions'

const { user } = useAuth0()
const { handleLogout, navigateToSettings } = useAuthActions()
const router = useRouter()

const navigateToHome = () => {
  router.push({ name: 'Invoices' })
}

const getUserInitials = (name: string | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
