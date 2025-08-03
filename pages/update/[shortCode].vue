<script setup lang="ts">
import type { UrlStats, UpdateUrlResponse, ApiError } from "~/types/index"

const route = useRoute()
const shortCode = route.params.shortCode as string

const { user: _user } = useAuthPageStandard(`URL bearbeiten - ${shortCode}`)

// Reactive Data
const loading = ref<boolean>(true)
const error = ref<string>("")
const urlData = ref<UrlStats | null>(null)

// Update Form
const newUrl = ref<string>("")
const updateLoading = ref<boolean>(false)
const updateError = ref<string>("")
const updateResult = ref<UpdateUrlResponse | null>(null)

// Load URL Data
const loadUrlData = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ""

    const response = await $fetch<UrlStats>(`/api/urls/${shortCode}/stats`)
    urlData.value = response
    newUrl.value = response.url.originalUrl // Pre-fill with current URL
  } catch (err: unknown) {
    const apiError = err as ApiError
    error.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Laden der URL-Daten"
  } finally {
    loading.value = false
  }
}

// Update URL
const updateUrl = async (): Promise<void> => {
  if (!newUrl.value.trim()) {
    updateError.value = "Bitte geben Sie eine URL ein"
    return
  }

  updateLoading.value = true
  updateError.value = ""
  updateResult.value = null

  try {
    const response = await $fetch<UpdateUrlResponse>(`/api/urls/${shortCode}`, {
      method: "PUT",
      body: {
        originalUrl: newUrl.value.trim(),
      },
    })

    updateResult.value = response
  } catch (err: unknown) {
    const apiError = err as ApiError
    updateError.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Aktualisieren der URL"
  } finally {
    updateLoading.value = false
  }
}

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

// Load data on mount
onMounted(async (): Promise<void> => {
  await loadUrlData()
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 text-sm"> ← Zurück zur Übersicht </NuxtLink>
      <h1 class="text-3xl font-bold text-gray-800 mt-4">URL bearbeiten</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
      <p class="text-gray-600 mt-4">URL-Daten werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Update Form -->
    <div v-else-if="urlData" class="space-y-6">
      <!-- Current URL Info -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Aktuelle URL-Informationen</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
            <p class="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
              {{ urlData.url.shortCode }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Erstellt am</label>
            <p class="text-gray-900">{{ formatDate(urlData.url.createdAt) }}</p>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Aktuelle URL</label>
          <p class="text-gray-900 break-all bg-gray-50 px-3 py-2 rounded">
            {{ urlData.url.originalUrl }}
          </p>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Statistiken</label>
          <p class="text-gray-900">{{ urlData.totalClicks }} Klicks</p>
        </div>
      </div>

      <!-- Update Form -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">URL aktualisieren</h2>

        <form class="space-y-4" @submit.prevent="updateUrl">
          <div>
            <label for="newUrl" class="block text-sm font-medium text-gray-700 mb-2"> Neue URL * </label>
            <input
              id="newUrl"
              v-model="newUrl"
              type="url"
              required
              placeholder="https://example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>

          <button
            type="submit"
            :disabled="updateLoading || !newUrl"
            class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {{ updateLoading ? "Wird aktualisiert..." : "URL aktualisieren" }}
          </button>
        </form>

        <!-- Update Success -->
        <div v-if="updateResult" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {{ updateResult.message }}
        </div>

        <!-- Update Error -->
        <div v-if="updateError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {{ updateError }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zusätzliche Styles falls nötig */
</style>
