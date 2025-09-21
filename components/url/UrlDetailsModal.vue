<script setup lang="ts">
import { ref, watch, nextTick } from "vue"
import type { UrlRecord, UpdateUrlResponse } from "~/types/index"

interface Props {
  shortCode: string
  shortUrl?: string
  originalUrl?: string
  title?: string
  isOpen: boolean
}

interface Emits {
  close: []
  updated: [url: UrlRecord]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialog = ref<HTMLDialogElement>()
const isDialogMounted = ref(false)

// QR Code state
const qrCodeUrl = ref("")

// Update state
const updateLoading = ref(false)
const updateError = ref("")
const updateSuccess = ref(false)

// Generate QR Code
async function generateQrCode() {
  if (!props.shortCode) return
  
  try {
    // Use the correct API route and get the image directly
    qrCodeUrl.value = `/api/qr/${props.shortCode}?format=png&size=200`
  } catch (err) {
    console.error("Failed to generate QR code:", err)
  }
}

// Download QR Code
async function downloadQrCode(format: 'png' | 'svg') {
  if (!props.shortCode) return
  
  try {
    const response = await fetch(`/api/qr/${props.shortCode}?format=${format}&download=true`)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${props.shortCode}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("Failed to download QR code:", err)
  }
}

// Update URL
async function updateUrl(data: { shortCode: string; originalUrl: string; title: string }) {
  if (!props.shortCode || !data.originalUrl.trim()) return

  try {
    updateLoading.value = true
    updateError.value = ""
    updateSuccess.value = false

    const body: { originalUrl: string; title?: string; newShortCode?: string } = { 
      originalUrl: data.originalUrl.trim() 
    }
    
    if (data.title !== undefined) {
      body.title = data.title.trim()
    }
    
    if (data.shortCode && data.shortCode !== props.shortCode) {
      body.newShortCode = data.shortCode
    }

    const { data: response, error } = await useFetch<UpdateUrlResponse>(`/api/urls/${props.shortCode}`, {
      method: "PUT",
      body,
    })

    if (error.value) {
      throw error.value
    }

    if (response.value?.success && response.value.url) {
      updateSuccess.value = true
      
      const updatedUrl: UrlRecord = {
        shortCode: response.value.url.shortCode,
        originalUrl: response.value.url.originalUrl,
        title: response.value.url.title || "",
        createdAt: new Date().toISOString(),
        createdBy: "current-user",
      }
      
      emit("updated", updatedUrl)
      
      setTimeout(() => {
        closeModal()
      }, 1500)
    }
  } catch (err) {
    const errorObj = err as Error & { data?: { detail?: string } }
    updateError.value = errorObj?.data?.detail ?? errorObj?.message ?? "Fehler beim Aktualisieren der URL"
  } finally {
    updateLoading.value = false
  }
}

function resetUpdate() {
  updateLoading.value = false
  updateError.value = ""
  updateSuccess.value = false
}

function openModal() {
  if (dialog.value && !dialog.value.open) {
    dialog.value.showModal()
    generateQrCode()
    nextTick(() => {
      isDialogMounted.value = true
    })
  }
}

function closeModal() {
  if (dialog.value) {
    dialog.value.close()
    resetUpdate()
    qrCodeUrl.value = ""
    isDialogMounted.value = false
    emit("close")
  }
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) {
    closeModal()
  }
}

function handleKeydown(event: KeyboardEvent) {
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
    class="modal-dialog"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
  >
    <div class="modal-content">
      <ModalHeader 
        :title="`URL Details: ${shortCode}`"
        @close="closeModal"
      />

      <div class="modal-body">
        <QrCodeSection
          :short-code="shortCode"
          :qr-code-url="qrCodeUrl"
          @download="downloadQrCode"
        />

        <AlertMessage
          v-if="updateError"
          type="error"
          title="Fehler beim Aktualisieren"
          :message="updateError"
        />

        <AlertMessage
          v-if="updateSuccess"
          type="success"
          title="Erfolgreich aktualisiert"
          message="Die URL wurde erfolgreich geändert."
        />

        <UrlForm
          :short-url="shortUrl || ''"
          :short-code="shortCode"
          :original-url="originalUrl || ''"
          :title="title"
          @changed="updateUrl"
          @cancel="closeModal"
        />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.modal-dialog {
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 0;
  max-width: 32rem;
  width: 100%;
  max-height: 90vh;
}

.modal-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #ffffff;
  border-radius: 0.5rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}
</style>
