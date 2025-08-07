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

// QR Code functionality
const qrCodeUrl = computed(() => {
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
  }
}

const closeModal = () => {
  if (dialog.value) {
    dialog.value.close()
    // Reset all states
    resetUpdate()
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
          <h2 class="text-lg font-semibold text-gray-900">URL bearbeiten: {{ shortCode }}</h2>
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
          <div class="flex items-center justify-center space-x-6">
            <!-- QR Code -->
            <div class="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img :src="qrCodeUrl" :alt="`QR-Code für ${shortCode}`" class="w-32 h-32">
            </div>
            
            <!-- Download Buttons -->
            <div class="flex flex-col space-y-2">
              <button
                type="button"
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center space-x-2"
                title="Als PNG herunterladen"
                @click="downloadQrCode('png')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>PNG</span>
              </button>
              <button
                type="button"
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center space-x-2"
                title="Als SVG herunterladen"
                @click="downloadQrCode('svg')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>SVG</span>
              </button>
            </div>
          </div>
        </div>

        <!-- URL Info & Edit -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Kurz-URL </label>
            <div class="flex items-center space-x-2">
              <input
                :value="shortUrl"
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              >
              <button
                type="button"
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                @click="copyToClipboard(shortUrl || '')"
              >
                Kopieren
              </button>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label for="newUrl" class="block text-sm font-medium text-gray-700 mb-1"> Ziel-URL </label>
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
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                @click="closeModal"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                :disabled="!!(updateLoading || !newUrl.trim() || updateSuccess)"
                class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ updateLoading ? "Wird aktualisiert..." : "URL aktualisieren" }}
              </button>
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
