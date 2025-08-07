<script setup lang="ts">
interface Props {
  shortCode: string
  shortUrl: string
  originalUrl: string
  isOpen: boolean
}

interface Emits {
  (e: "close"): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedSize = ref(200)
const availableSizes = [
  { value: 150, label: "Klein (150px)" },
  { value: 200, label: "Mittel (200px)" },
  { value: 300, label: "Groß (300px)" },
  { value: 400, label: "Extra Groß (400px)" }
]

function closeModal() {
  emit("close")
}

async function copyShortUrl() {
  try {
    await navigator.clipboard.writeText(props.shortUrl)
    // Could add a toast notification here
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Copy failed:', error)
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            QR-Code für Kurzlink
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="closeModal"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="px-6 py-4">
        <!-- URL Info -->
        <div class="mb-6">
          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kurzlink:
            </label>
            <div class="flex items-center gap-2">
              <code class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono">
                {{ shortUrl }}
              </code>
              <button
                class="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Link kopieren"
                @click="copyShortUrl"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ziel-URL:
            </label>
            <p class="text-sm text-gray-600 break-all">{{ originalUrl }}</p>
          </div>
        </div>

        <!-- Size Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            QR-Code Größe:
          </label>
          <select
            v-model="selectedSize"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option
              v-for="size in availableSizes"
              :key="size.value"
              :value="size.value"
            >
              {{ size.label }}
            </option>
          </select>
        </div>

        <!-- QR Code Display -->
        <div class="flex justify-center">
          <QrCodeDisplay
            :short-code="shortCode"
            :size="selectedSize"
            :show-download="true"
          />
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex justify-end">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="closeModal"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
