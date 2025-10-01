<script setup lang="ts">
const route = useRoute()
const shortCode = route.params.shortCode as string

const { user: _user } = useAuthPageStandard(`Statistiken - ${shortCode}`)

const statsStore = useStatsStore()

onMounted(async () => {
  await statsStore.loadStats(shortCode)
})
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Statistiken</h1>
          <p class="text-gray-600 mt-2">Detaillierte Analyse für {{ shortCode }}</p>
        </div>
      </div>
    </div>

    <div v-if="statsStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      <p class="mt-4 text-gray-600">Lade Statistiken...</p>
    </div>

    <div v-else-if="statsStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      ❌ {{ statsStore.error }}
      <BaseButton
        variant="danger"
        size="sm"
        @click="statsStore.loadStats(shortCode)"
      >
        Erneut versuchen
      </BaseButton>
    </div>

    <div v-else-if="statsStore.stats" class="space-y-6">
      <UrlItem
        :url="{
          shortCode: shortCode,
          originalUrl: statsStore.stats.url?.originalUrl || '',
          title: statsStore.stats.url?.title || 'Unbenannte URL',
          createdAt: statsStore.stats.url?.createdAt || new Date().toISOString(),
          createdBy: statsStore.stats.url?.createdBy || '',
          totalClicks: statsStore.stats.totalClicks,
        }"
        :show-actions="false"
      />

      <StatsOverview />
      <SourceBreakdown />
      <RecentClicks />
    </div>

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
