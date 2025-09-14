<script setup lang="ts">
import type { UrlRecord } from "~/types/index"

// Props & Emits
interface Props {
  urls: UrlRecord[]
  loading?: boolean
  error?: string
}

interface Emits {
  (e: "refresh" | "urlUpdated"): void
  (e: "deleted", shortCode: string): void
  (e: "openDetails", url: UrlRecord): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: "",
})

const emit = defineEmits<Emits>()

// Helper function for sorting URLs
const getSortedUrls = () => {
  return [...props.urls].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

// Error state for delete operations
const state = reactive({
  deleteError: ""
})

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
  }
}

const getShortUrl = (shortCode: string): string => {
  const config = useRuntimeConfig()
  return `${config.public.baseUrl}/${shortCode}`
}

// Unified Modal State
const unifiedModal = ref({
  isOpen: false,
  shortCode: "",
  shortUrl: "",
  originalUrl: "",
})

const openUnifiedModal = (url: UrlRecord): void => {
  unifiedModal.value = {
    isOpen: true,
    shortCode: url.shortCode,
    shortUrl: getShortUrl(url.shortCode),
    originalUrl: url.originalUrl,
  }
  emit("openDetails", url)
}

const closeUnifiedModal = (): void => {
  unifiedModal.value = {
    isOpen: false,
    shortCode: "",
    shortUrl: "",
    originalUrl: "",
  }
}

const handleUrlUpdated = (_updatedUrl: UrlRecord): void => {
  emit("urlUpdated")
  // Optionally show a success toast here
}

const deleteUrl = async (shortCode: string): Promise<void> => {
  try {
    state.deleteError = ""
    const { error } = await useFetch(`/api/urls/${shortCode}`, {
      method: 'DELETE'
    })

    if (error.value) {
      throw error.value
    }
    emit("deleted", shortCode)
  } catch (error: unknown) {
    const apiError = error as { data?: { message?: string }; message?: string }
    state.deleteError = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Löschen"
  }
}

const truncateUrl = (url: string | undefined, maxLength: number = 50): string => {
  if (!url) return ""
  return url.length > maxLength ? url.substring(0, maxLength) + "..." : url
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">Meine URLs</h2>
      <BaseButton variant="primary" :disabled="loading" :loading="loading" @click="emit('refresh')">
        {{ loading ? "Lädt..." : "Aktualisieren" }}
      </BaseButton>
    </div>
    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">❌ {{ error }}</div>
    <!-- Delete Error Message -->
    <div v-if="state.deleteError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">❌ {{ state.deleteError }}</div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <p class="mt-2 text-gray-600">Lade URLs...</p>
    </div>
    <!-- URLs Grid -->
    <div v-else-if="urls.length > 0" class="grid grid-cols-1 gap-4">
      <div
        v-for="url in getSortedUrls()"
        :key="url.shortCode"
        :data-testid="`url-item-${url.shortCode}`"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <!-- URL Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <h3 class="text-lg font-medium text-gray-900 truncate">{{ url.title || "Unbenannte URL" }}</h3>
              <span class="inline-flex px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                {{ url.shortCode }}
              </span>
            </div>
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Kurz-URL:</span>
                <BaseButton
                  :data-testid="`copy-button-${url.shortCode}`"
                  variant="ghost"
                  size="sm"
                  :title="getShortUrl(url.shortCode)"
                  @click="copyToClipboard(getShortUrl(url.shortCode))"
                >
                  <span class="mr-1">{{ getShortUrl(url.shortCode) }}</span>
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </BaseButton>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Ziel:</span>
                <a
                  :href="url.originalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  :title="url.originalUrl"
                >
                  {{ truncateUrl(url.originalUrl) }}
                  <svg class="inline h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <div class="text-xs text-gray-500">
                Erstellt: {{ formatDate(url.createdAt) }}
                <span v-if="url.createdBy">von {{ url.createdBy }}</span>
                <span v-if="url.totalClicks !== undefined" class="ml-2">• {{ url.totalClicks }} Klicks</span>
              </div>
            </div>
          </div>
          <!-- Actions -->
          <div class="flex flex-col space-y-2">
            <BaseButton 
              :data-testid="`details-button-${url.shortCode}`"
              variant="secondary" 
              size="sm" 
              title="QR-Code & Bearbeiten" 
              @click="openUnifiedModal(url)"
            >
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              Details
            </BaseButton>
            <BaseButton 
              :data-testid="`stats-button-${url.shortCode}`"
              variant="secondary" 
              size="sm" 
              title="Statistiken anzeigen"
              @click="$router.push(`/stats/${url.shortCode}`)"
            >
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Statistiken
            </BaseButton>
            <BaseButton 
              :data-testid="`delete-button-${url.shortCode}`"
              variant="danger" 
              size="sm" 
              title="URL löschen" 
              @click="deleteUrl(url.shortCode)"
            >
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Löschen
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Noch keine URLs erstellt</h3>
      <p class="mt-1 text-sm text-gray-500">Erstellen Sie Ihre erste Kurz-URL oben.</p>
    </div>
  </div>
  <!-- Details Modal -->
  <UrlDetailsModal
    :short-code="unifiedModal.shortCode"
    :short-url="unifiedModal.shortUrl"
    :original-url="unifiedModal.originalUrl"
    :is-open="unifiedModal.isOpen"
    @close="closeUnifiedModal"
    @updated="handleUrlUpdated"
  />
</template>
