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

      <!-- URL aktualisieren -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-bold mb-4">URL aktualisieren</h2>
        
        <form @submit.prevent="updateUrl" class="space-y-4">
          <div>
            <label for="updateShortCode" class="block text-sm font-medium text-gray-700 mb-2">
              Short-URL oder Short Code
            </label>
            <input
              id="updateShortCode"
              v-model="updateShortCode"
              type="text"
              required
              placeholder="http://localhost:3000/abc123 oder abc123"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>
          
          <div>
            <label for="newOriginalUrl" class="block text-sm font-medium text-gray-700 mb-2">
              Neue Original-URL
            </label>
            <input
              id="newOriginalUrl"
              v-model="newOriginalUrl"
              type="url"
              required
              placeholder="https://neue-url.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>
          
          <button
            type="submit"
            :disabled="updateLoading"
            class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {{ updateLoading ? 'Wird aktualisiert...' : 'URL aktualisieren' }}
          </button>
        </form>

        <!-- Update-Erfolg -->
        <div v-if="updateResult" class="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <h3 class="text-lg font-medium text-orange-800 mb-3">URL erfolgreich aktualisiert!</h3>
          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-orange-700">Short Code:</span>
              <span class="text-orange-600">{{ updateResult.shortCode }}</span>
            </div>
            <div>
              <span class="font-medium text-orange-700">Vorherige URL:</span>
              <span class="text-orange-600 break-all">{{ updateResult.previousUrl }}</span>
            </div>
            <div>
              <span class="font-medium text-orange-700">Neue URL:</span>
              <span class="text-orange-600 break-all">{{ updateResult.originalUrl }}</span>
            </div>
            <div>
              <span class="font-medium text-orange-700">Aktualisiert:</span>
              <span class="text-orange-600">{{ formatDate(updateResult.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Update-Fehler -->
        <div v-if="updateError" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800">{{ updateError }}</p>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Statistiken abrufen</h2>
        
        <form @submit.prevent="getStats" class="space-y-4">
          <div>
            <label for="statsUrl" class="block text-sm font-medium text-gray-700 mb-2">
              Short-URL oder Short Code
            </label>
            <input
              id="statsUrl"
              v-model="statsInput"
              type="text"
              required
              placeholder="http://localhost:3000/abc123 oder abc123"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
          </div>
          
          <button
            type="submit"
            :disabled="statsLoading"
            class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {{ statsLoading ? 'Wird geladen...' : 'Statistiken abrufen' }}
          </button>
        </form>

        <!-- Statistiken anzeigen -->
        <div v-if="stats" class="mt-6 space-y-6">
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Statistiken für {{ stats.shortCode }}</h3>
            
            <!-- Grunddaten -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ stats.totalClicks }}</div>
                <div class="text-sm text-blue-800">Gesamt-Klicks</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <div class="text-sm text-green-800 font-medium">Original-URL</div>
                <div class="text-xs text-green-600 break-all">{{ stats.originalUrl }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-800 font-medium">Erstellt</div>
                <div class="text-xs text-gray-600">{{ formatDate(stats.createdAt) }}</div>
              </div>
            </div>

            <!-- Quellen-Verteilung -->
            <div class="mb-6">
              <h4 class="text-md font-medium text-gray-800 mb-3">Traffic-Quellen</h4>
              <div class="space-y-2">
                <div 
                  v-for="(count, source) in stats.sourceTypes" 
                  :key="source"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span class="text-sm font-medium">{{ getSourceLabel(source) }}</span>
                  <div class="flex items-center space-x-2">
                    <div 
                      class="h-2 rounded-full"
                      :class="getSourceColor(source)"
                      :style="{ width: `${Math.max((count / stats.totalClicks) * 100, 10)}px` }"
                    ></div>
                    <span class="text-sm text-gray-600">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tägliche Klicks -->
            <div v-if="Object.keys(stats.dailyClicks).length > 0">
              <h4 class="text-md font-medium text-gray-800 mb-3">Tägliche Klicks</h4>
              <div class="space-y-1">
                <div 
                  v-for="(clicks, date) in sortedDailyClicks" 
                  :key="date"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <span>{{ formatDateShort(date) }}</span>
                  <span class="font-medium">{{ clicks }}</span>
                </div>
              </div>
            </div>

            <!-- Referrer -->
            <div v-if="Object.keys(stats.referrers).length > 0" class="mt-6">
              <h4 class="text-md font-medium text-gray-800 mb-3">Top Referrer</h4>
              <div class="space-y-1">
                <div 
                  v-for="(count, referrer) in sortedReferrers" 
                  :key="referrer"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <span class="truncate">{{ referrer }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistik-Fehler -->
        <div v-if="statsError" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800">{{ statsError }}</p>
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
const customCode = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref('')

// Reactive Data - URL Update
const updateShortCode = ref('')
const newOriginalUrl = ref('')
const updateLoading = ref(false)
const updateResult = ref(null)
const updateError = ref('')

// Reactive Data - Statistics
const statsInput = ref('')
const statsLoading = ref(false)
const stats = ref(null)
const statsError = ref('')

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
        customCode: customCode.value || undefined
      }
    })
    
    result.value = response
    originalUrl.value = ''
    customCode.value = ''
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

// Methods - URL Update
const updateUrl = async () => {
  updateLoading.value = true
  updateError.value = ''
  updateResult.value = null
  
  try {
    // Extrahiere Short Code aus Input (URL oder direkt Code)
    let shortCode = updateShortCode.value.trim()
    
    // Wenn es eine URL ist, extrahiere den Short Code
    if (shortCode.includes('/')) {
      const parts = shortCode.split('/')
      shortCode = parts[parts.length - 1]
    }
    
    if (!shortCode) {
      throw new Error('Bitte geben Sie einen gültigen Short Code ein')
    }
    
    const response = await $fetch(`/api/urls/${shortCode}`, {
      method: 'PUT',
      body: {
        originalUrl: newOriginalUrl.value
      }
    })
    
    updateResult.value = response
    updateShortCode.value = ''
    newOriginalUrl.value = ''
  } catch (err) {
    updateError.value = err.data?.message || err.message || 'Fehler beim Aktualisieren der URL'
  } finally {
    updateLoading.value = false
  }
}

// Methods - Statistics
const getStats = async () => {
  statsLoading.value = true
  statsError.value = ''
  stats.value = null
  
  try {
    // Extrahiere Short Code aus Input (URL oder direkt Code)
    let shortCode = statsInput.value.trim()
    
    // Wenn es eine URL ist, extrahiere den Short Code
    if (shortCode.includes('/')) {
      const parts = shortCode.split('/')
      shortCode = parts[parts.length - 1]
    }
    
    if (!shortCode) {
      throw new Error('Bitte geben Sie einen gültigen Short Code ein')
    }
    
    const response = await $fetch(`/api/urls/${shortCode}/stats`)
    stats.value = response
  } catch (err) {
    statsError.value = err.data?.message || err.message || 'Fehler beim Laden der Statistiken'
  } finally {
    statsLoading.value = false
  }
}

// Computed - Statistics
const sortedDailyClicks = computed(() => {
  if (!stats.value) return {}
  return Object.fromEntries(
    Object.entries(stats.value.dailyClicks).sort(([a], [b]) => b.localeCompare(a))
  )
})

const sortedReferrers = computed(() => {
  if (!stats.value) return {}
  return Object.fromEntries(
    Object.entries(stats.value.referrers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10
  )
})

// Helper Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getSourceLabel = (sourceType) => {
  const labels = {
    website: 'Website-Referrer',
    email_or_direct: 'E-Mail / Direktaufruf',
    qr_code: 'QR-Code (Mobile)'
  }
  return labels[sourceType] || sourceType
}

const getSourceColor = (sourceType) => {
  const colors = {
    website: 'bg-blue-500',
    email_or_direct: 'bg-green-500',
    qr_code: 'bg-purple-500'
  }
  return colors[sourceType] || 'bg-gray-500'
}
</script>
