<script setup lang="ts">
import type { UrlStats } from "~/types/index"

// Props
interface Props {
  stats: UrlStats
}

const props = defineProps<Props>()

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
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
  return `${config.public.baseUrl || "http://localhost:3000"}/${shortCode}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- URL Info Card -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            {{ stats.url.title || "Unbenannte URL" }}
          </h2>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Kurz-URL:</span>
              <button
                class="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                @click="copyToClipboard(getShortUrl(stats.url.shortCode))"
              >
                <span>{{ getShortUrl(stats.url.shortCode) }}</span>
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                :href="stats.url.originalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800 transition-colors break-all"
              >
                {{ stats.url.originalUrl }}
                <svg class="inline h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <div class="text-sm text-gray-500">
              Erstellt: {{ formatDate(stats.url.createdAt) }}
              <span v-if="stats.url.createdBy"> von {{ stats.url.createdBy }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-3">
          <NuxtLink
            :to="`/update/${stats.url.shortCode}`"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Bearbeiten
          </NuxtLink>
          <NuxtLink to="/" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Zurück
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard title="Gesamt-Klicks" :value="stats.totalClicks" icon="click" color="blue" />

      <StatsCard title="Unique Visitors" :value="stats.uniqueVisitors" icon="users" color="green" />

      <StatsCard
        title="Traffic-Quellen"
        :value="Object.keys(stats.sourceBreakdown).length"
        icon="globe"
        color="orange"
      />

      <StatsCard title="Top Referrer" :value="stats.topReferrers.length" icon="eye" color="purple" />
    </div>
  </div>
</template>
