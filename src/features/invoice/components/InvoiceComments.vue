<template>
  <div class="space-y-6">
    <!-- Comments List -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-4">{{ error }}</div>
      <Button @click="fetchComments" variant="outline" class="cursor-pointer">
        Intentar de nuevo
      </Button>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      No hay comentarios aún
    </div>

    <div v-else class="h-96 overflow-y-auto space-y-3 pr-2">
      <div v-for="(comment, index) in comments.slice().reverse()" :key="comment.id" 
        :class="[
          'flex items-start gap-3 py-3',
          isCurrentUserComment(comment) ? 'flex-row-reverse' : '',
          index < comments.length - 1 ? 'border-b border-gray-100' : ''
        ]">
        <!-- Author Avatar -->
        <Avatar class="h-7 w-7 flex-shrink-0">
          <AvatarImage :src="getAuthorAvatar(comment.author)" />
          <AvatarFallback class="text-xs">{{ getAuthorInitials(comment.author) }}</AvatarFallback>
        </Avatar>

        <div class="flex-1 min-w-0" :class="isCurrentUserComment(comment) ? 'text-right' : 'text-left'">
          <!-- Comment Header -->
          <div class="flex items-center gap-2 mb-1 justify-between">
            <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
            <div class="flex items-center gap-2" :class="isCurrentUserComment(comment) ? 'flex-row-reverse' : ''">
              <span class="text-sm font-medium text-gray-900">
                {{ comment.author.name || comment.author.email }}
              </span>
              <span v-if="comment.edited" class="text-xs text-gray-400">· editado</span>
            </div>
          </div>

          <!-- Comment Content -->
          <div v-if="comment.isDeleted" class="text-sm text-gray-400 italic">
            {{ comment.deletedMessage || 'Este comentario ha sido eliminado' }}
          </div>
          <div v-else class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {{ comment.message }}
          </div>

          <!-- Attachments -->
          <div v-if="comment.attachments.length > 0" class="mt-2 flex flex-wrap gap-2">
            <div v-for="attachment in comment.attachments" :key="attachment.id"
              @click="downloadAttachment(attachment.id)"
              class="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-3 py-2 cursor-pointer transition-colors min-w-[180px] flex-1">
              <svg class="w-4 h-4 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
              <span class="truncate flex-1 min-w-0">{{ attachment.fileName }}</span>
              <span class="text-gray-400 flex-shrink-0 text-[10px]">({{ formatFileSize(attachment.fileSizeBytes) }})</span>
              <svg class="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Form -->
    <CommentForm :invoice-id="invoiceId" @comment-created="handleCommentCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useInvoiceApi } from '../composables/useInvoiceApi'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatFileSize } from '@/lib/formatters'
import CommentForm from './CommentForm.vue'
import type { InvoiceComment } from '../types'

interface Props {
  invoiceId: string
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const { listComments, getCommentAttachmentDownloadUrl } = useInvoiceApi()

const comments = ref<InvoiceComment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchComments = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await listComments(props.invoiceId)
    comments.value = response.items
  } catch (err) {
    error.value = 'Error al cargar los comentarios'
    console.error('Error fetching comments:', err)
  } finally {
    loading.value = false
  }
}

const handleCommentCreated = (newComment: InvoiceComment) => {
  // Add the new comment to the list without refetching
  comments.value.push(newComment)
}

const downloadAttachment = async (attachmentId: string) => {
  try {
    const response = await getCommentAttachmentDownloadUrl(attachmentId)
    window.open(response.url, '_blank')
  } catch (err) {
    console.error('Error downloading attachment:', err)
    // TODO: Show error message to user
  }
}

const getAuthorAvatar = (author: { email?: string }) => {
  // You could implement Gravatar or other avatar service here
  return ''
}

const getAuthorInitials = (author: { name: string | null; email?: string }): string => {
  if (!author.name) {
    // Fallback to email if name is null
    const emailPart = author.email?.split('@')[0]
    return emailPart?.substring(0, 2).toUpperCase() || 'U'
  }
  return author.name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const isCurrentUserComment = (comment: InvoiceComment): boolean => {
  if (!user.value?.id || !comment.author.userId) {
    return false
  }
  return comment.author.userId === user.value.id
}

onMounted(() => {
  fetchComments()
})
</script>
