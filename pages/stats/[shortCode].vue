<script setup lang="ts">
import type { UrlStats } from '~/types/index'

// Auth Check
const { user, initAuth } = useAuth()

onMounted(async (): Promise<void> => {
  await initAuth()
  if (!user.value) {
    await navigateTo('/login')
  }
})

// Route Parameter
const route = useRoute()
const shortCode = route.params.shortCode as string

// Meta
useHead({
  title: `Statistiken - ${shortCode}`,
})

// Reactive Data
const loading = ref<boolean>(true)
const error = ref<string>('')
const stats = ref<UrlStats | null>(null)

// Load Stats
const loadStats = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch<UrlStats>(`/api/urls/${shortCode}/stats`)
    stats.value = response
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value =
      apiError?.data?.message ?? apiError?.message ?? 'Fehler beim Laden der Statistiken'
  } finally {
    loading.value = false
  }
}

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getSourceTypeLabel = (sourceType: string): string => {
  switch (sourceType) {
    case 'website':
      return '🌐 Website'
    case 'email':
      return '📧 E-Mail'
    case 'qr':
      return '📱 QR-Code'
    case 'direct':
      return '🔗 Direkt'
    default:
      return '❓ Unbekannt'
  }
}

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    alert('URL in Zwischenablage kopiert!')
  } catch (err) {
    console.error('Fehler beim Kopieren:', err)
    alert('Fehler beim Kopieren in die Zwischenablage')
  }
}

// Load data on mount
onMounted(async (): Promise<void> => {
  await loadStats()
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 text-sm">
        ← Zurück zur Übersicht
      </NuxtLink>
      <h1 class="text-3xl font-bold text-gray-800 mt-4">Statistiken</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Statistiken werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Stats Content -->
    <div v-else-if="stats" class="space-y-6">
      <!-- URL Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">URL-Informationen</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
            <div class="flex items-center space-x-2">
              <p class="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                {{ stats.shortCode }}
              </p>
              <button
                @click="copyToClipboard(`http://localhost:3000/${stats.shortCode}`)"
                class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📋 Kopieren
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Erstellt am</label>
            <p class="text-gray-900">{{ formatDate(stats.createdAt) }}</p>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Original-URL</label>
          <p class="text-gray-900 break-all bg-gray-50 px-3 py-2 rounded">
            {{ stats.originalUrl }}
          </p>
        </div>

        <div v-if="stats.title" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Titel</label>
          <p class="text-gray-900">{{ stats.title }}</p>
        </div>
      </div>

      <!-- Click Statistics -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Klick-Statistiken</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ stats.totalClicks }}
            </div>
            <div class="text-sm text-blue-800">Gesamt-Klicks</div>
          </div>

          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ stats.uniqueClicks }}
            </div>
            <div class="text-sm text-green-800">Einzigartige Besucher</div>
          </div>
        </div>

        <!-- Source Types -->
        <div v-if="stats.sourceTypes && Object.keys(stats.sourceTypes).length > 0">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Traffic-Quellen</h3>
          <div class="space-y-2">
            <div
              v-for="(count, sourceType) in stats.sourceTypes"
              :key="sourceType"
              class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
            >
              <span class="text-sm font-medium">{{ getSourceTypeLabel(sourceType) }}</span>
              <span class="text-sm text-gray-600">{{ count }} Klicks</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Clicks -->
      <div
        v-if="stats.recentClicks && stats.recentClicks.length > 0"
        class="bg-white rounded-lg shadow-md p-6"
      >
        <h2 class="text-xl font-bold text-gray-800 mb-4">Letzte Klicks</h2>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Zeitpunkt
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quelle
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Referrer
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(click, index) in stats.recentClicks"
                :key="index"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(click.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getSourceTypeLabel(click.sourceType) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                  {{ click.referrer || 'Direkt' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Clicks -->
      <div v-else class="bg-white rounded-lg shadow-md p-6 text-center">
        <div class="text-gray-500 py-8">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-lg font-medium mb-2">Noch keine Klicks</h3>
          <p class="text-sm">Diese URL wurde noch nicht aufgerufen.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zusätzliche Styles falls nötig */
</style>
