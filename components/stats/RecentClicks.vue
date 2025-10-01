<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { Source } from "~/types/index"
import StackedBar from "./StackedBar.vue"

const statsStore = useStatsStore()

const chartContainer = ref<HTMLElement>()
const isTransitioning = ref(false)
const animationDirection = ref<'left' | 'right' | null>(null)
const previousData = ref<typeof dailyData.value>([])
const showPrevious = ref(false)

const isLeftDisabled = computed(() => 
  Boolean(statsStore.loadingMore || !statsStore.stats?._links?.next)
)

const isRightDisabled = computed(() => 
  Boolean(!statsStore.stats?._links?.prev)
)

// Handle left button click - load next (older) data
function handleLeftClick() {
  if (statsStore.loadingMore || isTransitioning.value) return
  animationDirection.value = 'right'
  previousData.value = [...dailyData.value] // Use computed dailyData with all fields
  showPrevious.value = true
  statsStore.loadNextStats()
}

// Handle right button click - load prev (newer) data
function handleRightClick() {
  if (statsStore.loadingMore || isTransitioning.value) return
  animationDirection.value = 'left'
  previousData.value = [...dailyData.value] // Use computed dailyData with all fields
  showPrevious.value = true
  statsStore.loadPrevStats()
}

// Reset animation when loading completes
watch(() => statsStore.loadingMore, (newLoading) => {
  if (!newLoading && animationDirection.value) {
    isTransitioning.value = true
    
    setTimeout(() => {
      showPrevious.value = false
      isTransitioning.value = false
      animationDirection.value = null
    }, 600)
  }
})

function normalizeSourceBreakdown(): Record<string, number> {
  const normalized: Record<string, number> = {}
  Object.entries(statsStore.stats?.sourceBreakdown ?? {}).forEach(([source, count]) => {
    const normalizedSource = source.trim() || "direct"
    normalized[normalizedSource] = (normalized[normalizedSource] || 0) + count
  })

  if (Object.keys(normalized).length === 0) {
    normalized.direct = 0
  }

  return normalized
}

function calculateSources(clicks: number, normalizedBreakdown: Record<string, number>, totalSources: number): Source[] {
  if (clicks === 0) return []

  return Object.entries(normalizedBreakdown)
    .map(([id, amount]) => ({
      id,
      count: totalSources > 0 ? Math.round(clicks * (amount / totalSources)) : 0,
      color: getSourceColor(id),
      label: getSourceLabel(id),
    }))
    .filter((source) => source.count > 0)
}

function monthName(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short" })
}

const dailyData = computed(() => {
  // Use all available daily stats and reverse order (oldest first, left side)
  const rawData = [...(statsStore.stats?.dailyStats || [])].reverse()
  if (rawData.length === 0) return []

  const maxClicks = Math.max(...rawData.map((d) => d.clicks), 1)
  const normalizedBreakdown = normalizeSourceBreakdown()
  const totalSources = Object.values(normalizedBreakdown).reduce((sum, count) => sum + count, 0)

  return rawData.map((item, index) => {
    const [_year, monthNum, dayNum] = item.date.split("-")
    const previousMonth = index > 0 ? rawData[index - 1]?.date.split("-")[1] : null
    const percentage = (item.clicks / maxClicks) * 100
    const sources = calculateSources(item.clicks, normalizedBreakdown, totalSources)
    const day = index % 3 === 0 || index === rawData.length - 1 ? dayNum || "" : ""
    const month = index === 0 || monthNum !== previousMonth ? monthName(item.date) : ""

    return {
      ...item,
      percentage,
      sources,
      day,
      month,
    }
  })
})

const availableSources = computed(() => {
  return Object.keys(normalizeSourceBreakdown()).filter(Boolean)
})

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    website: "#3b82f6",
    direct: "#6b7280",
    "qr-code": "#8b5cf6",
    email: "#10b981",
    social: "#f59e0b",
    referral: "#ef4444",
    email_or_direct: "#06b6d4",
  }
  return colors[source] ?? "#f97316"
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    website: "Website",
    direct: "Direkt",
    "qr-code": "QR-Code",
    email: "E-Mail",
    social: "Social Media",
    referral: "Verweis",
    email_or_direct: "E-Mail/Direkt",
  }
  return labels[source] ?? source
}
</script>

<template>
  <div class="recent-clicks-chart">
    <div class="chart-header">
      <h3 class="chart-title">Tägliche Klicks nach Quelle</h3>
    </div>

    <div class="legend">
      <div v-for="source in availableSources" :key="source" class="legend-item">
        <div class="legend-color" :style="{ backgroundColor: getSourceColor(source) }" />
        <span>{{ getSourceLabel(source) }}</span>
      </div>
    </div>

    <div class="chart-wrapper">
      <!-- Left Navigation Button -->
      <button
        :disabled="isLeftDisabled"
        title="Ältere Daten laden"
        class="nav-button nav-left"
        @click="handleLeftClick"
      >
        <svg
          v-if="statsStore.loadingMore"
          class="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Chart Container -->
      <div ref="chartContainer" class="chart-container">
        <div v-if="dailyData.length === 0 && !showPrevious" class="no-data">
          Keine Daten verfügbar
        </div>
        
        <!-- Previous Data (sliding out) -->
        <div
          v-if="showPrevious"
          class="chart-bars previous-bars"
          :class="{
            'slide-out-left': isTransitioning && animationDirection === 'left',
            'slide-out-right': isTransitioning && animationDirection === 'right'
          }"
        >
          <StackedBar v-for="item in previousData" :key="`prev-${item.date}`" v-bind="item" />
        </div>
        
        <!-- Current Data (sliding in) -->
        <div
          v-if="dailyData.length > 0"
          class="chart-bars current-bars"
          :class="{
            'slide-in-from-right': isTransitioning && animationDirection === 'left',
            'slide-in-from-left': isTransitioning && animationDirection === 'right'
          }"
        >
          <StackedBar v-for="item in dailyData" :key="item.date" v-bind="item" />
        </div>
      </div>

      <!-- Right Navigation Button -->
      <button
        :disabled="isRightDisabled"
        title="Neuere Daten anzeigen"
        class="nav-button nav-right"
        @click="handleRightClick"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.recent-clicks-chart {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.legend {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.chart-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 200px; /* Nur die Höhe der Balken */
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 200px; /* Höhe der Balken ohne Datum-Labels */
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.nav-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-left:disabled {
  opacity: 0.3;
}

.chart-container {
  height: 250px;
  display: flex;
  align-items: flex-end;
  padding-top: 2rem;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  height: 100%;
  gap: 2px;
  width: 100%;
  opacity: 1;
  --bar-width: calc((100% - 58px) / 30); /* 30 bars with 2px gaps */
}

.previous-bars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.current-bars {
  position: relative;
  z-index: 1;
}

.slide-out-left {
  transform: translateX(-100%);
  transition: transform 0.6s ease-out;
}

.slide-out-right {
  transform: translateX(100%);
  transition: transform 0.6s ease-out;
}

.slide-in-from-left {
  transform: translateX(-100%);
  animation: slideInLeft 0.6s ease-out forwards;
}

.slide-in-from-right {
  transform: translateX(100%);
  animation: slideInRight 0.6s ease-out forwards;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@media (max-width: 768px) {
  .chart-bars {
    gap: 0.5px;
  }

  .legend {
    gap: 0.5rem;
  }

  .legend-item {
    font-size: 0.75rem;
  }
}
</style>
