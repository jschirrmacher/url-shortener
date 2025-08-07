<script setup lang="ts">
interface Props {
  shortCode: string
  size?: number
  showDownload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  showDownload: true,
})

const qrCodeUrl = computed(() => `/api/qr/${props.shortCode}?size=${props.size}`)
const downloadUrl = computed(() => `/api/qr/${props.shortCode}?size=${props.size}&download=true`)
const svgDownloadUrl = computed(() => `/api/qr/${props.shortCode}?format=svg&size=${props.size}&download=true`)

const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref("")
const isClient = ref(false)

// Check if we're on client side
onMounted(() => {
  isClient.value = true
})

function handleImageLoad() {
  isLoading.value = false
  hasError.value = false
  errorMessage.value = ""
}

function handleImageError() {
  isLoading.value = false
  hasError.value = true
  errorMessage.value = "QR-Code konnte nicht geladen werden"
}

async function downloadQrCode(format: "png" | "svg") {
  try {
    const url = format === "svg" ? svgDownloadUrl.value : downloadUrl.value
    const filename = `qr-${props.shortCode}.${format}`
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Download failed:", error)
  }
}

// Reset loading state when shortCode changes
watch(
  () => props.shortCode,
  () => {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ""
  },
)
</script>

<template>
  <div class="qr-code-container">
    <div class="qr-code-wrapper" :style="{ width: `${size}px`, height: `${size}px` }">
      <!-- Show loading initially -->
      <div v-if="!isClient || isLoading" class="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p class="text-xs text-gray-500 mt-2">QR-Code wird geladen...</p>
        </div>
      </div>

      <!-- Show error state -->
      <div
        v-else-if="hasError"
        class="flex items-center justify-center w-full h-full bg-red-50 border-2 border-red-200 rounded-lg"
      >
        <div class="text-center">
          <svg class="mx-auto h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-sm text-red-600 mt-1">{{ errorMessage }}</p>
          <p class="text-xs text-gray-500 mt-1">URL: {{ qrCodeUrl }}</p>
        </div>
      </div>

      <ClientOnly>
        <img
          :src="qrCodeUrl"
          :alt="`QR-Code für ${shortCode}`"
          class="w-full h-full object-contain rounded-lg border border-gray-200"
          @load="handleImageLoad"
          @error="handleImageError"
        >
      </ClientOnly>
    </div>

    <!-- Download Buttons - only show when QR code is loaded -->
    <div v-if="isClient && showDownload && !isLoading && !hasError" class="mt-4 flex gap-2 justify-center">
      <button
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        @click="downloadQrCode('png')"
      >
        <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        PNG herunterladen
      </button>

      <button
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        @click="downloadQrCode('svg')"
      >
        <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        SVG herunterladen
      </button>
    </div>
  </div>
</template>

<style scoped>
.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
