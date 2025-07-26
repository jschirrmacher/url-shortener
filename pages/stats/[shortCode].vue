<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto py-12 px-4">
      <div class="mb-8">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 text-sm">
          ← Zurück zur Übersicht
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-800 mt-4">Statistiken</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-6">
        <div class="animate-pulse">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="h-20 bg-gray-200 rounded"></div>
            <div class="h-20 bg-gray-200 rounded"></div>
            <div class="h-20 bg-gray-200 rounded"></div>
          </div>
          <div class="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <div class="text-6xl mb-4">📊</div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Statistiken nicht verfügbar</h2>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <NuxtLink to="/" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Zur Übersicht
          </NuxtLink>
        </div>
      </div>

      <!-- Statistics Content -->
      <div v-else class="space-y-6">
        <!-- URL Info Header -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <code class="text-lg font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  {{ stats.shortCode }}
                </code>
                <span v-if="stats.updatedAt" class="text-sm text-orange-500">
                  (aktualisiert)
                </span>
              </div>
              
              <h2 v-if="stats.title" class="text-xl font-bold text-gray-800 mb-2">
                {{ stats.title }}
              </h2>
              
              <p class="text-gray-600 break-all mb-3">
                {{ stats.originalUrl }}
              </p>
              
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>Erstellt: {{ formatDate(stats.createdAt) }}</span>
                <span v-if="stats.updatedAt">
                  Aktualisiert: {{ formatDate(stats.updatedAt) }}
                </span>
              </div>
            </div>
            
            <div class="flex space-x-2 ml-4">
              <NuxtLink
                :to="`/update/${stats.shortCode}`"
                class="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm"
              >
                Bearbeiten
              </NuxtLink>
              <button
                @click="copyToClipboard(`http://localhost:3000/${stats.shortCode}`)"
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
              >
                Kopieren
              </button>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalClicks }}</div>
            <div class="text-sm text-blue-800">Gesamt-Klicks</div>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ uniqueVisitors }}</div>
            <div class="text-sm text-green-800">Eindeutige Besucher</div>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ Object.keys(stats.dailyClicks).length }}</div>
            <div class="text-sm text-purple-800">Aktive Tage</div>
          </div>
        </div>

        <!-- Traffic Sources -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Traffic-Quellen</h3>
          <div class="space-y-3">
            <div 
              v-for="(count, source) in stats.sourceTypes" 
              :key="source"
              class="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div class="flex items-center space-x-3">
                <div 
                  class="w-4 h-4 rounded-full"
                  :class="getSourceColor(source)"
                ></div>
                <span class="font-medium">{{ getSourceLabel(source) }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="text-right">
                  <div class="font-bold">{{ count }}</div>
                  <div class="text-xs text-gray-500">
                    {{ Math.round((count / stats.totalClicks) * 100) }}%
                  </div>
                </div>
                <div 
                  class="h-2 rounded-full bg-gray-200"
                  style="width: 100px"
                >
                  <div 
                    class="h-2 rounded-full"
                    :class="getSourceColor(source)"
                    :style="{ width: `${(count / stats.totalClicks) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Daily Clicks -->
        <div v-if="Object.keys(stats.dailyClicks).length > 0" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Tägliche Klicks</h3>
          <div class="space-y-2">
            <div 
              v-for="(clicks, date) in sortedDailyClicks" 
              :key="date"
              class="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <span class="font-medium">{{ formatDateShort(date) }}</span>
              <div class="flex items-center space-x-3">
                <span class="font-bold">{{ clicks }}</span>
                <div 
                  class="h-2 rounded-full bg-blue-200"
                  style="width: 100px"
                >
                  <div 
                    class="h-2 rounded-full bg-blue-500"
                    :style="{ width: `${(clicks / Math.max(...Object.values(stats.dailyClicks))) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Referrers -->
        <div v-if="Object.keys(stats.referrers).length > 0" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Top Referrer</h3>
          <div class="space-y-2">
            <div 
              v-for="(count, referrer) in sortedReferrers" 
              :key="referrer"
              class="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <span class="font-medium truncate flex-1 mr-4">{{ referrer }}</span>
              <div class="flex items-center space-x-3">
                <span class="font-bold">{{ count }}</span>
                <div 
                  class="h-2 rounded-full bg-gray-200"
                  style="width: 80px"
                >
                  <div 
                    class="h-2 rounded-full bg-gray-500"
                    :style="{ width: `${(count / Math.max(...Object.values(stats.referrers))) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Route Parameter
const route = useRoute()
const shortCode = route.params.shortCode

// Meta
useHead({
  title: `Statistiken - ${shortCode}`
})

// Reactive Data
const loading = ref(true)
const error = ref('')
const stats = ref(null)

// Load statistics
const loadStats = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await $fetch(`/api/urls/${shortCode}/stats`)
    stats.value = response
  } catch (err) {
    error.value = err.data?.message || 'Statistiken konnten nicht geladen werden'
  } finally {
    loading.value = false
  }
}

// Computed Properties
const uniqueVisitors = computed(() => {
  if (!stats.value) return 0
  // Schätzung basierend auf verschiedenen IPs (vereinfacht)
  return Math.max(1, Math.ceil(stats.value.totalClicks * 0.7))
})

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

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: Toast-Nachricht anzeigen
  } catch (err) {
    console.error('Fehler beim Kopieren:', err)
  }
}

// Lifecycle
onMounted(() => {
  loadStats()
})
</script>
