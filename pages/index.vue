<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto py-12 px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">URL-Shortener</h1>
        <p class="text-gray-600">Verkürze URLs und verfolge Analytics</p>
      </div>

      <!-- URL-Erstellung -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-bold mb-4">URL verkürzen</h2>
        
        <form @submit.prevent="createShortUrl" class="space-y-4">
          <div>
            <label for="originalUrl" class="block text-sm font-medium text-gray-700 mb-2">
              Original-URL
            </label>
            <input
              id="originalUrl"
              v-model="originalUrl"
              type="url"
              required
              placeholder="https://example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="Meine wichtige URL"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <div>
            <label for="customCode" class="block text-sm font-medium text-gray-700 mb-2">
              Custom Code (optional)
            </label>
            <input
              id="customCode"
              v-model="customCode"
              type="text"
              placeholder="mein-code"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Wird erstellt...' : 'URL verkürzen' }}
          </button>
        </form>
        
        <!-- Erfolg -->
        <div v-if="result" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 class="text-lg font-medium text-green-800 mb-3">URL erfolgreich erstellt!</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-green-700">Kurz-URL:</label>
              <div class="flex items-center space-x-2">
                <input
                  :value="result.shortUrl"
                  readonly
                  class="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md"
                >
                <button
                  @click="copyToClipboard(result.shortUrl)"
                  class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Kopieren
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-green-700">Original-URL:</label>
              <p class="text-sm text-green-600 break-all">{{ result.originalUrl }}</p>
            </div>
          </div>
        </div>
        
        <!-- Fehler -->
        <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- URL-Liste -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Erstellte URLs</h2>
          <button
            @click="loadUrls"
            :disabled="urlsLoading"
            class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
          >
            {{ urlsLoading ? 'Lädt...' : 'Aktualisieren' }}
          </button>
        </div>
        
        <div v-if="urlsError" class="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p class="text-red-800">{{ urlsError }}</p>
        </div>
        
        <div v-if="urlsLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p class="text-gray-600">URLs werden geladen...</p>
        </div>
        
        <div v-else-if="urls.length === 0" class="text-center py-8 text-gray-500">
          Noch keine URLs erstellt
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="url in urls"
            :key="url.shortCode"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                  <code class="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {{ url.shortCode }}
                  </code>
                  <span class="text-sm text-gray-500">
                    {{ url.totalClicks }} Klicks
                  </span>
                  <span v-if="url.updatedAt" class="text-xs text-orange-500">
                    (aktualisiert)
                  </span>
                </div>
                
                <h3 v-if="url.title" class="font-medium text-gray-900 mb-1">
                  {{ url.title }}
                </h3>
                
                <p class="text-sm text-gray-600 break-all mb-2">
                  {{ url.originalUrl }}
                </p>
                
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Erstellt: {{ formatDateShort(url.createdAt) }}</span>
                  <button
                    @click="copyToClipboard(url.shortUrl)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    Short-URL kopieren
                  </button>
                </div>
              </div>
              
              <div class="flex flex-col space-y-2 ml-4">
                <NuxtLink
                  :to="`/update/${url.shortCode}`"
                  class="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm text-center"
                >
                  Bearbeiten
                </NuxtLink>
                <NuxtLink
                  :to="`/stats/${url.shortCode}`"
                  class="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm text-center"
                >
                  Statistiken
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta
useHead({
  title: 'URL-Shortener'
})

// Reactive Data - URL Creation
const originalUrl = ref('')
const title = ref('')
const customCode = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref('')

// Reactive Data - URL List
const urls = ref([])
const urlsLoading = ref(false)
const urlsError = ref('')

// Methods - URL Creation
const createShortUrl = async () => {
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    const response = await $fetch('/api/urls', {
      method: 'POST',
      body: {
        originalUrl: originalUrl.value,
        customCode: customCode.value || undefined,
        title: title.value || undefined
      }
    })
    
    result.value = response
    originalUrl.value = ''
    title.value = ''
    customCode.value = ''
    
    // Aktualisiere URL-Liste
    await loadUrls()
  } catch (err) {
    error.value = err.data?.message || 'Fehler beim Erstellen der Kurz-URL'
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: Toast-Nachricht anzeigen
  } catch (err) {
    console.error('Fehler beim Kopieren:', err)
  }
}

// Methods - URL List
const loadUrls = async () => {
  urlsLoading.value = true
  urlsError.value = ''
  
  try {
    urls.value = await $fetch('/api/urls')
  } catch (err) {
    urlsError.value = err.data?.message || 'Fehler beim Laden der URLs'
  } finally {
    urlsLoading.value = false
  }
}

// Helper Methods
const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadUrls()
})
</script>
