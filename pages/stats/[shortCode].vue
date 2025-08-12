<script setup lang="ts">
import type { UrlStats } from "~/types/index"

const route = useRoute()
const shortCode = route.params.shortCode as string

const { user: _user } = useAuthPageStandard(`Statistiken - ${shortCode}`)

const loading = ref<boolean>(true)
const error = ref<string>("")
const stats = ref<UrlStats | null>(null)

onMounted(async (): Promise<void> => {
  // Load stats after auth
  await loadStats()
})

// Load Stats
const loadStats = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ""

    const response = await $fetch<UrlStats>(`/api/urls/${shortCode}/stats`)
    stats.value = response
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Laden der Statistiken"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Statistiken</h1>
      <p class="text-gray-600 mt-2">Detaillierte Analyse für {{ shortCode }}</p>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      <p class="mt-4 text-gray-600">Lade Statistiken...</p>
    </div>
    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      ❌ {{ error }}
      <BaseButton variant="danger" size="sm" @click="loadStats">Erneut versuchen</BaseButton>
    </div>
    <!-- Stats Content -->
    <div v-else-if="stats" class="space-y-6">
      <!-- URL Info with QR Code -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-2">URL-Informationen</h3>
            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium text-gray-500">Kurz-URL:</span>
                <p class="text-sm text-blue-600 font-mono">{{ `${$config.public.baseUrl}/${shortCode}` }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Ziel-URL:</span>
                <p class="text-sm text-gray-700 break-all">{{ stats.url?.originalUrl }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Stats Overview -->
      <StatsOverview :stats="stats" />
      <!-- Source Breakdown -->
      <SourceBreakdown :stats="stats" />
      <!-- Recent Clicks -->
      <RecentClicks :stats="stats" />
    </div>
    <!-- No Data State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Statistiken verfügbar</h3>
      <p class="mt-1 text-sm text-gray-500">Für diese URL sind noch keine Daten vorhanden.</p>
    </div>
  </div>
</template>
