<script setup lang="ts">
// Props
interface Props {
  sourceTypes: Record<string, number>
  referrers: Record<string, number>
}

const props = defineProps<Props>()

// Helper Methods
const getSourceIcon = (source: string): string => {
  switch (source) {
    case "website":
      return "🌐"
    case "email":
      return "📧"
    case "qr":
      return "📱"
    case "direct":
      return "🔗"
    default:
      return "❓"
  }
}

const getSourceLabel = (source: string): string => {
  switch (source) {
    case "website":
      return "Website"
    case "email":
      return "E-Mail"
    case "qr":
      return "QR-Code"
    case "direct":
      return "Direkt"
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
  return Object.entries(props.sourceTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Top 10
})

const sortedReferrers = computed(() => {
  return Object.entries(props.referrers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Top 10
})

const totalSourceClicks = computed(() => getTotalClicks(props.sourceTypes))
const totalReferrerClicks = computed(() => getTotalClicks(props.referrers))
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
          v-for="[referrer, count] in sortedReferrers"
          :key="referrer"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-700 truncate">
              {{ referrer === "direct" ? "Direkter Zugriff" : referrer }}
            </div>
            <div v-if="referrer !== 'direct'" class="text-sm text-gray-500 truncate">
              {{ referrer }}
            </div>
          </div>
          <div class="text-right ml-4">
            <div class="font-semibold text-gray-800">{{ count }}</div>
            <div class="text-sm text-gray-500">{{ getPercentage(count, totalReferrerClicks) }}%</div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500">Keine Referrer verfügbar</div>
    </div>
  </div>
</template>
