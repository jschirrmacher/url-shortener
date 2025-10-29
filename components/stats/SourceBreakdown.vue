<script setup lang="ts">
const statsStore = useStatsStore()

function getSourceIcon(source: string) {
  const icons: Record<string, string> = {
    website: "🌐",
    email: "📧",
    qr: "📱",
    direct: "🔗",
  }
  return icons[source] || "❓"
}

function getSourceLabel(source: string) {
  const labels: Record<string, string> = {
    website: "Website",
    email: "E-Mail",
    qr: "QR-Code",
    direct: "Direkt",
  }
  return labels[source] || source
}

const sortedSources = computed(() => {
  const breakdown = statsStore.stats?.sourceBreakdown || {}
  return Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
})

const sortedReferrers = computed(() => {
  return (statsStore.stats?.topReferrers ?? []).slice(0, 10)
})

function getTotalClicks(breakdown: Record<string, number>) {
  return Object.values(breakdown).reduce((sum, count) => sum + count, 0)
}

const totalSourceClicks = computed(() => getTotalClicks(statsStore.stats?.sourceBreakdown || {}))
const totalReferrerClicks = computed(() => statsStore.stats?.totalClicks || 0)

const sourceItems = computed(() => 
  sortedSources.value.map(([source, count]) => ({
    key: source,
    label: getSourceLabel(source),
    count,
    icon: getSourceIcon(source)
  }))
)

const referrerItems = computed(() => 
  sortedReferrers.value.map(referrer => ({
    key: referrer.referrer,
    label: referrer.referrer === "Direct" ? "Direkter Zugriff" : referrer.referrer,
    count: referrer.count
  }))
)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <StatsSection
      title="Traffic-Quellen"
      :items="sourceItems"
      :total-count="totalSourceClicks"
      empty-message="Keine Traffic-Quellen verfügbar"
    />
    
    <StatsSection
      title="Top Referrer"
      :items="referrerItems"
      :total-count="totalReferrerClicks"
      empty-message="Keine Referrer verfügbar"
    />
  </div>
</template>
