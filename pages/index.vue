<script setup lang="ts">
import type { UrlRecord } from '~/types/index'

// Meta
useHead({
  title: 'URL Shortener - Dashboard'
})

// Auth Check
const { user, initAuth } = useAuth()

onMounted(async (): Promise<void> => {
  await initAuth()
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  
  // Lade URLs nach erfolgreicher Auth
  await loadUrls()
})

// Reactive Data
const originalUrl = ref<string>('')
const customCode = ref<string>('')
const title = ref<string>('')
const loading = ref<boolean>(false)
const error = ref<string>('')
const success = ref<string>('')
const urls = ref<UrlRecord[]>([])
const urlsLoading = ref<boolean>(true)

// Create short URL
const createShortUrl = async (): Promise<void> => {
  if (!originalUrl.value.trim()) {
    error.value = 'Bitte geben Sie eine URL ein'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch<{ shortCode: string; shortUrl: string }>('/api/urls', {
      method: 'POST',
      body: {
        originalUrl: originalUrl.value.trim(),
        customCode: customCode.value.trim() || undefined,
        title: title.value.trim() || undefined
      }
    })

    success.value = `Short-URL erstellt: ${response.shortUrl}`
    
    // Reset form
    originalUrl.value = ''
    customCode.value = ''
    title.value = ''
    
    // Reload URLs
    await loadUrls()
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value = apiError?.data?.message ?? apiError?.message ?? 'Fehler beim Erstellen der Short-URL'
  } finally {
    loading.value = false
  }
}

// Load URLs
const loadUrls = async (): Promise<void> => {
  try {
    urlsLoading.value = true
    const response = await $fetch<UrlRecord[]>('/api/urls')
    urls.value = response
  } catch (err: unknown) {
    console.error('Fehler beim Laden der URLs:', err)
  } finally {
    urlsLoading.value = false
  }
}

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-600 mt-2">Verkürze URLs und verfolge Analytics</p>
    </div>

    <!-- URL Creation Form -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Neue Short-URL erstellen</h2>
      
      <form @submit.prevent="createShortUrl" class="space-y-4">
        <div>
          <label for="originalUrl" class="block text-sm font-medium text-gray-700 mb-2">
            URL *
          </label>
          <input
            id="originalUrl"
            v-model="originalUrl"
            type="url"
            required
            placeholder="https://example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="customCode" class="block text-sm font-medium text-gray-700 mb-2">
              Custom Code (optional)
            </label>
            <input
              id="customCode"
              v-model="customCode"
              type="text"
              placeholder="mein-code"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>
          
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Titel (optional)
            </label>
            <input
              id="title"
              v-model="title"
              type="text"
              placeholder="Beschreibung der URL"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {{ loading ? 'Wird erstellt...' : 'Short-URL erstellen' }}
        </button>
      </form>

      <!-- Success Message -->
      <div v-if="success" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        ✅ {{ success }}
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        ❌ {{ error }}
      </div>
    </div>

    <!-- URLs List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Meine URLs</h2>
      
      <!-- Loading State -->
      <div v-if="urlsLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">URLs werden geladen...</p>
      </div>

      <!-- URLs Table -->
      <div v-else-if="urls.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short-URL
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original-URL
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Klicks
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Erstellt
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="url in urls" :key="url.shortCode" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-blue-600">
                  <button @click="copyToClipboard(`http://localhost:3000/${url.shortCode}`)" class="hover:underline">
                    {{ url.shortCode }}
                  </button>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 truncate max-w-xs" :title="url.originalUrl">
                  {{ url.originalUrl }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ url.totalClicks ?? 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(url.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <NuxtLink
                  :to="`/stats/${url.shortCode}`"
                  class="text-blue-600 hover:text-blue-900"
                >
                  📊 Stats
                </NuxtLink>
                <NuxtLink
                  :to="`/update/${url.shortCode}`"
                  class="text-green-600 hover:text-green-900"
                >
                  ✏️ Bearbeiten
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No URLs -->
      <div v-else class="text-center py-8 text-gray-500">
        Noch keine URLs erstellt. Erstellen Sie Ihre erste Short-URL oben!
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zusätzliche Styles falls nötig */
</style>
