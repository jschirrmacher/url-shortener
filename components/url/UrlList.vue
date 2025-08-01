<script setup lang="ts">
import type { UrlRecord } from "~/types/index"

// Props & Emits
interface Props {
  urls: UrlRecord[]
  loading?: boolean
  error?: string
}

interface Emits {
  (e: "refresh"): void
  (e: "urlUpdated"): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: "",
})

const emit = defineEmits<Emits>()

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

const truncateUrl = (url: string, maxLength: number = 50): string => {
  return url.length > maxLength ? url.substring(0, maxLength) + "..." : url
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">Meine URLs</h2>
      <button
        @click="emit('refresh')"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {{ loading ? "Lädt..." : "Aktualisieren" }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">❌ {{ error }}</div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      <p class="mt-2 text-gray-600">Lade URLs...</p>
    </div>

    <!-- URLs Grid -->
    <div v-else-if="urls.length > 0" class="grid gap-4">
      <div
        v-for="url in urls"
        :key="url.shortCode"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <!-- URL Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-2">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ url.title || "Unbenannte URL" }}
              </h3>
              <span class="inline-flex px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                {{ url.shortCode }}
              </span>
            </div>

            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Kurz-URL:</span>
                <button
                  @click="copyToClipboard(getShortUrl(url.shortCode))"
                  class="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                  :title="getShortUrl(url.shortCode)"
                >
                  <span>{{ getShortUrl(url.shortCode) }}</span>
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
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
                <span v-if="url.createdBy"> von {{ url.createdBy }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <NuxtLink
              :to="`/stats/${url.shortCode}`"
              class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Statistiken
            </NuxtLink>
            <NuxtLink
              :to="`/update/${url.shortCode}`"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Bearbeiten
            </NuxtLink>
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">Keine URLs vorhanden</h3>
      <p class="mt-1 text-sm text-gray-500">Erstellen Sie Ihre erste Kurz-URL oben.</p>
    </div>
  </div>
</template>
