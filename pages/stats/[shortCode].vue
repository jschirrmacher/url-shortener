<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          ← Zurück zur Übersicht
        </NuxtLink>
      </div>
      
      <div v-if="pending" class="text-center py-8">
        <p>Lade Statistiken...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-red-800">{{ error.data?.message || 'Fehler beim Laden der Statistiken' }}</p>
      </div>
      
      <div v-else-if="stats" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h1 class="text-2xl font-bold mb-4">Statistiken für {{ stats.shortCode }}</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Original-URL:</label>
              <p class="text-sm text-gray-900 break-all">{{ stats.originalUrl }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Erstellt am:</label>
              <p class="text-sm text-gray-900">{{ formatDate(stats.createdAt) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Gesamt-Statistiken -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Übersicht</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-3xl font-bold text-blue-600">{{ stats.totalClicks }}</div>
              <div class="text-sm text-blue-800">Gesamt-Klicks</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-3xl font-bold text-green-600">{{ Object.keys(stats.dailyClicks).length }}</div>
              <div class="text-sm text-green-800">Aktive Tage</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-3xl font-bold text-purple-600">{{ Object.keys(stats.referrers).length }}</div>
              <div class="text-sm text-purple-800">Verschiedene Referrer</div>
            </div>
          </div>
        </div>
        
        <!-- Quellen-Analyse -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Traffic-Quellen</h2>
          <div class="space-y-3">
            <div
              v-for="(count, sourceType) in stats.sourceTypes"
              :key="sourceType"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :class="getSourceColor(sourceType)"></div>
                <span class="font-medium">{{ getSourceLabel(sourceType) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-lg font-bold">{{ count }}</span>
                <span class="text-sm text-gray-500">
                  ({{ Math.round((count / stats.totalClicks) * 100) }}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tägliche Klicks -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Tägliche Klicks</h2>
          <div class="space-y-2">
            <div
              v-for="(count, date) in sortedDailyClicks"
              :key="date"
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <span class="text-sm font-medium">{{ formatDate(date) }}</span>
              <div class="flex items-center space-x-2">
                <div
                  class="h-2 bg-blue-500 rounded"
                  :style="{ width: `${(count / maxDailyClicks) * 100}px` }"
                ></div>
                <span class="text-sm font-bold w-8 text-right">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Top Referrer -->
        <div v-if="Object.keys(stats.referrers).length > 0" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Top Referrer</h2>
          <div class="space-y-2">
            <div
              v-for="(count, referrer) in sortedReferrers"
              :key="referrer"
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <span class="text-sm font-medium truncate flex-1">{{ referrer }}</span>
              <span class="text-sm font-bold ml-2">{{ count }}</span>
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

// Data Fetching
const { data: stats, pending, error } = await useFetch(`/api/urls/${shortCode}/stats`)

// Computed
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

const maxDailyClicks = computed(() => {
  if (!stats.value) return 1
  return Math.max(...Object.values(stats.value.dailyClicks))
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
