<script setup lang="ts">
import type { UrlRecord, UpdateUrlResponse, ApiError } from "~/types/index"

interface Props {
  shortCode: string
  shortUrl?: string
  originalUrl?: string
  isOpen: boolean
}

interface Emits {
  close: []
  updated: [url: UrlRecord]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialog = ref<HTMLDialogElement>()
const newUrl = ref("")
const isDialogMounted = ref(false)

function useUrlUpdate(shortCode: Ref<string>) {
  const updateLoading = ref(false)
  const updateError = ref("")
  const updateSuccess = ref(false)

  const updateUrl = async (newUrl: string): Promise<boolean> => {
    if (!shortCode.value || !newUrl.trim()) return false

    try {
      updateLoading.value = true
      updateError.value = ""
      updateSuccess.value = false

      await $fetch<UpdateUrlResponse>(`/api/urls/${shortCode.value}`, {
        method: "PUT",
        body: { originalUrl: newUrl.trim() },
      })

      updateSuccess.value = true
      return true
    } catch (err: unknown) {
      const apiError = err as ApiError
      updateError.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Aktualisieren der URL"
      return false
    } finally {
      updateLoading.value = false
    }
  }

  const resetUpdate = () => {
    updateError.value = ""
    updateSuccess.value = false
    updateLoading.value = false
  }

  return {
    updateLoading: readonly(updateLoading),
    updateError: readonly(updateError),
    updateSuccess: readonly(updateSuccess),
    updateUrl,
    resetUpdate,
  }
}

// Initialize composables
const shortCodeRef = toRef(props, "shortCode")
const { updateLoading, updateError, updateSuccess, updateUrl, resetUpdate } = useUrlUpdate(shortCodeRef)

// QR Code functionality - only load when dialog is mounted
const qrCodeUrl = computed(() => {
  if (!isDialogMounted.value || !props.shortCode) return ""

  const config = useRuntimeConfig()
  return `${config.public.baseUrl}/api/qr/${props.shortCode}`
})

const downloadQrCode = async (format: "png" | "svg" = "png") => {
  try {
    const url = format === "svg" ? `${qrCodeUrl.value}?format=svg` : qrCodeUrl.value

    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `qr-code-${props.shortCode}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch {
    // Silently handle download errors
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Silently handle clipboard errors
  }
}

// Modal management
const openModal = () => {
  if (dialog.value) {
    dialog.value.showModal()
    // Initialize form with current URL
    newUrl.value = props.originalUrl || ""
    // Enable QR code loading after dialog is mounted
    nextTick(() => {
      isDialogMounted.value = true
    })
  }
}

const closeModal = () => {
  if (dialog.value) {
    dialog.value.close()
    // Reset all states
    resetUpdate()
    isDialogMounted.value = false
    emit("close")
  }
}

// Handle form submission
const handleSubmit = async () => {
  const success = await updateUrl(newUrl.value)
  if (success) {
    // Create updated URL record
    const updatedUrl: UrlRecord = {
      shortCode: props.shortCode,
      originalUrl: newUrl.value,
      createdAt: new Date().toISOString(), // We don't have the original date here
      createdBy: "current-user", // We don't have user info here
    }
    emit("updated", updatedUrl)

    // Auto-close after successful update
    setTimeout(() => {
      closeModal()
    }, 1500)
  }
}

// Handle backdrop clicks
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === dialog.value) {
    closeModal()
  }
}

// Handle ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeModal()
  }
}

// Watch for isOpen prop changes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      openModal()
    } else {
      closeModal()
    }
  },
)
</script>

<template>
  <dialog
    ref="dialog"
    class="backdrop:bg-black backdrop:bg-opacity-50 bg-transparent p-0 max-w-lg w-full"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
  >
    <div class="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">URL Details: {{ shortCode }}</h2>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md p-1"
            @click="closeModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- QR Code Section -->
        <div class="pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">QR-Code</h3>
          <div class="grid grid-cols-[auto_1fr] gap-6 items-center justify-center">
            <!-- QR Code -->
            <div class="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <div v-if="!qrCodeUrl" class="w-32 h-32 flex items-center justify-center bg-gray-100 rounded">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
              </div>
              <img v-else :src="qrCodeUrl" :alt="`QR-Code für ${shortCode}`" class="w-32 h-32" >
            </div>

            <!-- Download Buttons -->
            <div class="grid grid-rows-2 gap-2 min-w-[120px]">
              <DownloadButton format="png" :disabled="!qrCodeUrl" @click="downloadQrCode('png')" />
              <DownloadButton format="svg" :disabled="!qrCodeUrl" @click="downloadQrCode('svg')" />
            </div>
          </div>
        </div>

        <!-- URL Info & Edit -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kurz-URL</label>
            <div class="flex items-center space-x-2">
              <input
                :value="shortUrl"
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              >
              <BaseButton variant="secondary" size="sm" @click="copyToClipboard(shortUrl || '')">Kopieren</BaseButton>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label for="newUrl" class="block text-sm font-medium text-gray-700 mb-1">Ziel-URL</label>
              <input
                id="newUrl"
                v-model="newUrl"
                type="url"
                required
                placeholder="https://example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
            </div>

            <!-- Update Error -->
            <div v-if="updateError" class="bg-red-50 border border-red-200 rounded-md p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Fehler beim Aktualisieren</h3>
                  <p class="mt-1 text-sm text-red-700">{{ updateError }}</p>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="updateSuccess" class="bg-green-50 border border-green-200 rounded-md p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">Erfolgreich aktualisiert</h3>
                  <p class="mt-1 text-sm text-green-700">Die URL wurde erfolgreich geändert.</p>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <BaseButton variant="secondary" @click="closeModal">Abbrechen</BaseButton>
              <BaseButton
                variant="primary"
                type="submit"
                :disabled="!!(updateLoading || !newUrl.trim() || updateSuccess)"
                :loading="updateLoading"
              >
                {{ updateLoading ? "Wird aktualisiert..." : "URL aktualisieren" }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
