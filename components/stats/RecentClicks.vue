<script setup lang="ts">
// Props
interface Props {
  recentClicks: Array<{
    timestamp: string
    sourceType: string
    referrer: string
  }>
}

const props = defineProps<Props>()

// Helper Methods
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

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

const getSourceColor = (source: string): string => {
  switch (source) {
    case "website":
      return "bg-blue-100 text-blue-800"
    case "email":
      return "bg-green-100 text-green-800"
    case "qr":
      return "bg-purple-100 text-purple-800"
    case "direct":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-orange-100 text-orange-800"
  }
}

const truncateReferrer = (referrer: string, maxLength: number = 40): string => {
  if (referrer === "direct") return "Direkter Zugriff"
  return referrer.length > maxLength ? referrer.substring(0, maxLength) + "..." : referrer
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Letzte Klicks</h3>

    <div v-if="recentClicks.length > 0" class="space-y-3">
      <div
        v-for="(click, index) in recentClicks"
        :key="index"
        class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center space-x-3">
          <span class="text-lg">{{ getSourceIcon(click.sourceType) }}</span>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-medium text-gray-700">{{ getSourceLabel(click.sourceType) }}</span>
              <span
                :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getSourceColor(click.sourceType)]"
              >
                {{ getSourceLabel(click.sourceType) }}
              </span>
            </div>
            <div class="text-sm text-gray-500 mt-1">
              {{ truncateReferrer(click.referrer) }}
            </div>
          </div>
        </div>

        <div class="text-right">
          <div class="text-sm text-gray-600">{{ formatDateTime(click.timestamp) }}</div>
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Klicks vorhanden</h3>
      <p class="mt-1 text-sm text-gray-500">Sobald jemand Ihre URL besucht, erscheinen hier die Details.</p>
    </div>
  </div>
</template>
