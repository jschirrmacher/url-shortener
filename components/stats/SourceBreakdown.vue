<script setup lang="ts">
import type { UrlStats } from "~/types/index"

// Props
interface Props {
  stats: UrlStats
}

const props = defineProps<Props>()

// Helper Methods
const getSourceIcon = (source: string): string => {
  switch (source) {
    case "website":
      return "🌐"
    case "direct":
      return "🔗"
    case "qr-code":
      return "📱"
    default:
      return "❓"
  }
}

const getSourceLabel = (source: string): string => {
  switch (source) {
    case "website":
      return "Website"
    case "direct":
      return "Direkt"
    case "qr-code":
      return "QR-Code"
    default:
      return source
  }
}

const getPercentage = (value: number, total: number): number => {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

const getTotalClicks = (data: Record<string, number>): number => {
  return Object.values(data).reduce((sum, count) => sum + count, 0)
}

const sortedSources = computed(() => {
  return Object.entries(props.stats.sourceBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Top 10
})

const sortedReferrers = computed(() => {
  return props.stats.topReferrers.slice(0, 10) // Top 10
})

const totalSourceClicks = computed(() => getTotalClicks(props.stats.sourceBreakdown))
const totalReferrerClicks = computed(() => props.stats.totalClicks)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Traffic Sources -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Traffic-Quellen</h3>

      <div v-if="sortedSources.length > 0" class="space-y-3">
        <div
          v-for="[source, count] in sortedSources"
          :key="source"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <div class="flex items-center space-x-3">
            <span class="text-lg">{{ getSourceIcon(source) }}</span>
            <span class="font-medium text-gray-700">{{ getSourceLabel(source) }}</span>
          </div>
          <div class="text-right">
            <div class="font-semibold text-gray-800">{{ count }}</div>
            <div class="text-sm text-gray-500">{{ getPercentage(count, totalSourceClicks) }}%</div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500">Keine Traffic-Quellen verfügbar</div>
    </div>

    <!-- Top Referrers -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Referrer</h3>

      <div v-if="sortedReferrers.length > 0" class="space-y-3">
        <div
          v-for="referrer in sortedReferrers"
          :key="referrer.referrer"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-700 truncate">
              {{ referrer.referrer === "Direct" ? "Direkter Zugriff" : referrer.referrer }}
            </div>
            <div v-if="referrer.referrer !== 'Direct'" class="text-sm text-gray-500 truncate">
              {{ referrer.referrer }}
            </div>
          </div>
          <div class="text-right ml-4">
            <div class="font-semibold text-gray-800">{{ referrer.count }}</div>
            <div class="text-sm text-gray-500">{{ getPercentage(referrer.count, totalReferrerClicks) }}%</div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500">Keine Referrer verfügbar</div>
    </div>
  </div>
</template>
