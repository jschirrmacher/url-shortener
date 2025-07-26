<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-2xl mx-auto py-12 px-4">
      <div class="mb-8">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 text-sm">
          ← Zurück zur Übersicht
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-800 mt-4">URL bearbeiten</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-6">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div class="h-10 bg-gray-200 rounded mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div class="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <div class="text-6xl mb-4">❌</div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">URL nicht gefunden</h2>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <NuxtLink to="/" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Zur Übersicht
          </NuxtLink>
        </div>
      </div>

      <!-- Update Form -->
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-800 mb-2">Aktuelle URL-Informationen</h3>
          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-gray-700">Short Code:</span>
              <code class="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ shortCode }}</code>
            </div>
            <div v-if="currentUrl.title">
              <span class="font-medium text-gray-700">Aktueller Titel:</span>
              <span class="ml-2 text-gray-600">{{ currentUrl.title }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Aktuelle URL:</span>
              <span class="ml-2 text-gray-600 break-all">{{ currentUrl.originalUrl }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Erstellt:</span>
              <span class="ml-2 text-gray-600">{{ formatDate(currentUrl.createdAt) }}</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="updateUrl" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Titel (optional)
            </label>
            <input
              id="title"
              v-model="newTitle"
              type="text"
              placeholder="Neuer Titel für die URL"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>

          <div>
            <label for="originalUrl" class="block text-sm font-medium text-gray-700 mb-2">
              Original-URL *
            </label>
            <input
              id="originalUrl"
              v-model="newOriginalUrl"
              type="url"
              required
              placeholder="https://neue-url.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>

          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="updateLoading"
              class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {{ updateLoading ? 'Wird aktualisiert...' : 'URL aktualisieren' }}
            </button>
            <NuxtLink
              to="/"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-center"
            >
              Abbrechen
            </NuxtLink>
          </div>
        </form>

        <!-- Success Message -->
        <div v-if="updateResult" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 class="text-lg font-medium text-green-800 mb-3">✅ URL erfolgreich aktualisiert!</h3>
          <div class="space-y-2 text-sm">
            <div v-if="updateResult.title">
              <span class="font-medium text-green-700">Neuer Titel:</span>
              <span class="text-green-600">{{ updateResult.title }}</span>
            </div>
            <div>
              <span class="font-medium text-green-700">Neue URL:</span>
              <span class="text-green-600 break-all">{{ updateResult.originalUrl }}</span>
            </div>
            <div class="pt-2">
              <NuxtLink to="/" class="text-green-700 hover:text-green-900 underline">
                Zurück zur Übersicht
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="updateError" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800">{{ updateError }}</p>
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
  title: `URL bearbeiten - ${shortCode}`
})

// Reactive Data
const loading = ref(true)
const error = ref('')
const currentUrl = ref(null)
const newTitle = ref('')
const newOriginalUrl = ref('')
const updateLoading = ref(false)
const updateResult = ref(null)
const updateError = ref('')

// Load current URL data
const loadCurrentUrl = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await $fetch(`/api/urls/${shortCode}/stats`)
    currentUrl.value = response
    
    // Pre-fill form with current values
    newTitle.value = response.title || ''
    newOriginalUrl.value = response.originalUrl
  } catch (err) {
    error.value = err.data?.message || 'URL nicht gefunden'
  } finally {
    loading.value = false
  }
}

// Update URL
const updateUrl = async () => {
  updateLoading.value = true
  updateError.value = ''
  updateResult.value = null
  
  try {
    const response = await $fetch(`/api/urls/${shortCode}`, {
      method: 'PUT',
      body: {
        originalUrl: newOriginalUrl.value,
        title: newTitle.value || undefined
      }
    })
    
    updateResult.value = response
  } catch (err) {
    updateError.value = err.data?.message || 'Fehler beim Aktualisieren der URL'
  } finally {
    updateLoading.value = false
  }
}

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

// Lifecycle
onMounted(() => {
  loadCurrentUrl()
})
</script>
