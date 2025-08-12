<script setup lang="ts">
import type { UrlStats } from "~/types/index"

// Props
interface Props {
  stats: UrlStats
}

const props = defineProps<Props>()

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const _getSourceIcon = (source: string): string => {
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

const _getSourceLabel = (source: string): string => {
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

const _getSourceColor = (source: string): string => {
  switch (source) {
    case "website":
      return "bg-blue-100 text-blue-800"
    case "direct":
      return "bg-gray-100 text-gray-800"
    case "qr-code":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-orange-100 text-orange-800"
  }
}

// Sort daily stats by date (most recent first)
const sortedDailyStats = computed(() => {
  return [...props.stats.dailyStats]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10) // Show last 10 days
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Tägliche Statistiken</h3>
    <div v-if="sortedDailyStats.length > 0" class="space-y-3">
      <div
        v-for="(day, index) in sortedDailyStats"
        :key="index"
        class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center space-x-3">
          <span class="text-lg">📅</span>
          <div>
            <div class="font-medium text-gray-700">{{ formatDate(day.date) }}</div>
            <div class="text-sm text-gray-500">{{ day.uniqueVisitors }} unique Besucher</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-800">{{ day.clicks }} Klicks</div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Statistiken vorhanden</h3>
      <p class="mt-1 text-sm text-gray-500">Sobald jemand Ihre URL besucht, erscheinen hier die Details.</p>
    </div>
  </div>
</template>
