<template>
    <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
            <!-- User Avatar -->
            <Avatar class="h-8 w-8">
                <AvatarImage :src="userAvatar" />
                <AvatarFallback>{{ userInitials }}</AvatarFallback>
            </Avatar>

            <!-- Comment Form -->
            <div class="flex-1 space-y-3">
                <div>
                    <Label for="comment-message" class="sr-only">Escribe un comentario</Label>
                    <Input id="comment-message" v-model="message" placeholder="Escribe un comentario..." class="w-full"
                        :disabled="isSubmitting" />
                </div>

                <!-- File Upload Area -->
                <div v-if="selectedFiles.length > 0" class="space-y-2">
                    <div class="text-sm text-gray-600">Archivos seleccionados:</div>
                    <div class="space-y-1">
                        <div v-for="(file, index) in selectedFiles" :key="index"
                            class="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg>
                                <span class="text-sm text-gray-700">{{ file.name }}</span>
                                <span class="text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
                            </div>
                            <Button @click="removeFile(index)" variant="ghost" size="sm"
                                class="h-6 w-6 p-0 text-gray-400 hover:text-red-500 cursor-pointer" :disabled="isSubmitting">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>

                <!-- File Upload Area -->
                <div class="flex items-center gap-2">
                    <input ref="fileInput" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx"
                        @change="handleFileSelect" class="hidden" :disabled="isSubmitting" />

                    <!-- Clickable Upload Area -->
                    <div @click="fileInput?.click()"
                        class="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors"
                        :class="isSubmitting ? 'opacity-50 cursor-not-allowed' : ''">
                        <div class="flex items-center justify-center gap-2 text-gray-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                </path>
                            </svg>
                            <span class="text-sm font-medium">
                                {{ isSubmitting ? 'Procesando...' : 'Haz clic para adjuntar archivos' }}
                            </span>
                        </div>
                        <div class="text-xs text-gray-500 text-center mt-1">
                            PDF, PNG, JPG, JPEG, TXT, DOCX, XLSX
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end">
                    <Button @click="submitComment" :disabled="!message.trim() || isSubmitting"
                        class="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer">
                        <span v-if="isSubmitting" class="flex items-center gap-2">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Enviando...
                        </span>
                        <span v-else>Enviar comentario</span>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInvoiceApi } from '../composables/useInvoiceApi'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatFileSize } from '@/lib/formatters'
import type { CreateCommentRequest, CommentAttachmentPresignedUrlRequest, InvoiceComment } from '../types'

interface Props {
    invoiceId: string
}

interface Emits {
    (e: 'comment-created', comment: InvoiceComment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const { createComment, getCommentAttachmentPresignedUrls, uploadToS3 } = useInvoiceApi()

const message = ref('')
const selectedFiles = ref<File[]>([])
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const userAvatar = computed(() => '') // User avatar not supported yet
const userInitials = computed(() => {
    const name = user.value?.name || 'Usuario'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        const newFiles = Array.from(target.files)
        selectedFiles.value = [...selectedFiles.value, ...newFiles]
    }
}

const removeFile = (index: number) => {
    selectedFiles.value.splice(index, 1)
}

const getFileTypeFromMimeType = (mimeType: string): string => {
    const mimeToType: Record<string, string> = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpeg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'text/plain': 'txt',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    }
    return mimeToType[mimeType] || 'pdf' // fallback to pdf
}

const submitComment = async () => {
    if (!message.value.trim()) return

    isSubmitting.value = true

    try {
        // Upload files if any
        const attachments: Array<{
            fileId: string
            fileName: string
            contentType: string
            fileSizeBytes: number
        }> = []

        if (selectedFiles.value.length > 0) {
            // Group files by type for the API
            const filesByType = selectedFiles.value.reduce((acc, file) => {
                const fileType = getFileTypeFromMimeType(file.type)
                if (!acc[fileType]) {
                    acc[fileType] = []
                }
                acc[fileType].push(file)
                return acc
            }, {} as Record<string, File[]>)

            const presignedRequest: CommentAttachmentPresignedUrlRequest = {
                files: Object.entries(filesByType).map(([fileType, files]) => ({
                    fileType: fileType as any,
                    count: files.length
                }))
            }

            const presignedResponse = await getCommentAttachmentPresignedUrls(props.invoiceId, presignedRequest)

            // Upload files to S3 and collect attachment details
            let urlIndex = 0
            for (const [fileType, files] of Object.entries(filesByType)) {
                for (const file of files) {
                    const presignedUrl = presignedResponse.urls[urlIndex]
                    if (!presignedUrl) {
                        throw new Error('Presigned URL no disponible')
                    }
                    await uploadToS3(presignedUrl.url, file)

                    attachments.push({
                        fileId: presignedUrl.id,
                        fileName: file.name,
                        contentType: file.type,
                        fileSizeBytes: file.size
                    })
                    urlIndex++
                }
            }
        }

        // Create comment
        const commentData: CreateCommentRequest = {
            message: message.value.trim(),
            attachments: attachments.length > 0 ? attachments : undefined
        }

        const newComment = await createComment(props.invoiceId, commentData)

        // Clear form
        message.value = ''
        selectedFiles.value = []

        emit('comment-created', newComment)
    } catch (error) {
        console.error('Error creating comment:', error)
        // TODO: Show error message to user
    } finally {
        isSubmitting.value = false
    }
}
</script>
