<script setup lang="ts">
import { computed } from "vue"
import type { UrlStats, Source } from "~/types/index"
import StackedBar from "./StackedBar.vue"

interface Props {
  stats: UrlStats
}

type DayData = {
  date: string
  clicks: number
  uniqueVisitors: number
}

type SourceBreakdown = Record<string, number>

const props = defineProps<Props>()

function createLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toISOString().split("T")[0] ?? "")
  }
  return days
}

function mapExistingData(days: string[]): DayData[] {
  const dataMap = new Map()
  props.stats.dailyStats?.forEach((item) => {
    dataMap.set(item.date, item)
  })

  return days.map((date) => {
    const existing = dataMap.get(date)
    return existing || { date, clicks: 0, uniqueVisitors: 0 }
  })
}

function normalizeSourceBreakdown(): SourceBreakdown {
  const normalized: SourceBreakdown = {}
  Object.entries(props.stats.sourceBreakdown ?? {}).forEach(([source, count]) => {
    const normalizedSource = source.trim() || "direct"
    normalized[normalizedSource] = (normalized[normalizedSource] || 0) + count
  })

  if (Object.keys(normalized).length === 0) {
    normalized.direct = 0
  }

  return normalized
}

function calculateSources(clicks: number, normalizedBreakdown: SourceBreakdown, totalSources: number): Source[] {
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
  const days = createLast30Days()
  const data = mapExistingData(days)
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1)
  const normalizedBreakdown = normalizeSourceBreakdown()
  const totalSources = Object.values(normalizedBreakdown).reduce((sum, count) => sum + count, 0)

  return data.map((item, index) => {
    const [_year, monthNum, dayNum] = item.date.split("-")
    const previousMonth = index > 0 ? data[index - 1]?.date.split("-")[1] : null
    const percentage = (item.clicks / maxClicks) * 100
    const sources = calculateSources(item.clicks, normalizedBreakdown, totalSources)
    const day = index % 3 === 0 || index === data.length - 1 ? dayNum || "" : ""
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
    <h3 class="chart-title">Tägliche Klicks nach Quelle (letzte 30 Tage)</h3>

    <div class="legend">
      <div v-for="source in availableSources" :key="source" class="legend-item">
        <div class="legend-color" :style="{ backgroundColor: getSourceColor(source) }" />
        <span>{{ getSourceLabel(source) }}</span>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-bars">
        <StackedBar v-for="item in dailyData" :key="item.date" v-bind="item" />
      </div>
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

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
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

.chart-container {
  height: 250px;
  display: flex;
  align-items: flex-end;
  padding-top: 2rem;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 1px;
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
