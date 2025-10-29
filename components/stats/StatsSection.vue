<script setup lang="ts">
interface StatItem {
  key: string
  label: string
  count: number
  icon?: string
}

interface Props {
  title: string
  items: StatItem[]
  totalCount: number
  emptyMessage: string
}

defineProps<Props>()

function getPercentage(count: number, total: number) {
  if (total === 0) return "0"
  return ((count / total) * 100).toFixed(1)
}
</script>

<template>
  <div class="stats-section">
    <h3 class="stats-title">{{ title }}</h3>
    <div v-if="items.length > 0" class="space-y-3">
      <div
        v-for="item in items"
        :key="item.key"
        class="stats-item"
      >
        <div class="stats-item-content">
          <span v-if="item.icon" class="text-lg">{{ item.icon }}</span>
          <span class="stats-item-label">{{ item.label }}</span>
        </div>
        <div class="stats-item-values">
          <div class="stats-item-count">{{ item.count }}</div>
          <div class="stats-item-percentage">{{ getPercentage(item.count, totalCount) }}%</div>
        </div>
      </div>
    </div>
    <div v-else class="stats-empty">{{ emptyMessage }}</div>
  </div>
</template>

<style scoped>
.stats-section {
  background-color: var(--bg-primary);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
}

.stats-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.stats-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: var(--bg-tertiary);
}

.stats-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.stats-item-label {
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-item-values {
  text-align: right;
  margin-left: 1rem;
}

.stats-item-count {
  font-weight: 600;
  color: var(--text-primary);
}

.stats-item-percentage {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stats-empty {
  text-align: center;
  padding: 2rem 0;
  color: var(--text-secondary);
}
</style>
