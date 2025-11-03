<template>
  <AuthenticatedLayout>
    <template #title>
      <h1 class="text-3xl font-bold text-foreground">Mis Facturas</h1>
    </template>

    <template #actions>
      <div class="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="px-6 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
              Constancia AFIP
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="openPdf('https://static.finpilot.ar/sanos/TAC.pdf')" class="cursor-pointer">
              TAC
            </DropdownMenuItem>
            <DropdownMenuItem @click="openPdf('https://static.finpilot.ar/sanos/SANOSONLINE.pdf')"
              class="cursor-pointer">
              Sanos
            </DropdownMenuItem>
            <DropdownMenuItem @click="openPdf('https://static.finpilot.ar/sanos/NATIVUS.pdf')" class="cursor-pointer">
              Nativus
            </DropdownMenuItem>
            <DropdownMenuItem @click="openPdf('https://static.finpilot.ar/sanos/MADRYNSALUD.pdf')"
              class="cursor-pointer">
              Madryn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button @click="router.push({ name: 'InvoiceUpload' })"
          class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nueva Factura
        </Button>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Invoice List -->
      <InvoiceList />
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import InvoiceList from '../components/InvoiceList.vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const router = useRouter()

const openPdf = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
