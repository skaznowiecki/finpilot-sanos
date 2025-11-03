<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

defineProps<{
    class?: string
    altText?: string
}>()
</script>

<template>
    <Button :class="cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        $props.class
    )" :aria-label="altText">
        <slot />
    </Button>
</template>