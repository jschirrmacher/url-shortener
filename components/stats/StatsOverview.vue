<script setup lang="ts">
const statsStore = useStatsStore()
</script>

<template>
  <div class="stats-overview">
    <!-- Stats Cards Grid -->
    <div class="stats-grid">
      <StatsCard title="Gesamt-Klicks" :value="statsStore.stats?.totalClicks || 0" icon="click" color="blue" />
      <StatsCard title="Unique Visitors" :value="statsStore.stats?.uniqueVisitors || 0" icon="users" color="green" />
      <StatsCard
        title="Traffic-Quellen"
        :value="Object.keys(statsStore.stats?.sourceBreakdown || {}).length"
        icon="globe"
        color="orange"
      />
      <StatsCard title="Top Referrer" :value="statsStore.stats?.topReferrers?.length || 0" icon="eye" color="purple" />
    </div>
  </div>
</template>

<style scoped>
.stats-overview {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
