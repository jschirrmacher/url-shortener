<script setup lang="ts">
import type { Source } from "~/types/index"

interface Props {
  percentage: number
  clicks: number
  uniqueVisitors: number
  day: string
  month: string
  sources: Source[]
}

defineProps<Props>()
</script>

<template>
  <div class="stacked-bar">
    <div
      class="stack"
      :class="{ empty: clicks === 0 }"
      :style="{ height: clicks === 0 ? '2px' : `${percentage}%` }"
      :title="`${day}: ${clicks} Klicks gesamt, ${uniqueVisitors} unique Besucher`"
    >
      <template v-if="clicks > 0">
        <template
          v-for="source in sources"
          :key="source.id"
        >
          <div
            class="segment"
            :style="{
              height: `${(source.count / clicks) * 100}%`,
              backgroundColor: source.color
            }"
            :title="`${source.label}: ${source.count}`"
          />
        </template>
        <span class="value">{{ clicks }}</span>
      </template>
    </div>
    <div class="label-space">
      <div class="label">{{ day }}</div>
      <div class="month">{{ month }}</div>
    </div>
  </div>
</template>

<style scoped>
.stacked-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: var(--bar-width, calc((100% - (30 - 1) * 2px) / 30));
  min-width: var(--bar-width, calc((100% - (30 - 1) * 2px) / 30));
  max-width: var(--bar-width, calc((100% - (30 - 1) * 2px) / 30));
  flex-shrink: 0;
  position: relative;
  overflow: visible;
}

.stack {
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 0.25rem 0.25rem 0 0;
  overflow: visible;
}

.stack:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.empty {
  background-color: #f3f4f6;
  border-radius: 0.125rem;
}

.segment {
  transition: all 0.3s ease;
  clip-path: inset(0 0 0 0 round 0.25rem 0.25rem 0 0);
}

.value {
  position: absolute;
  top: -1.2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  font-weight: 500;
  color: #374151;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  transition: opacity 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
}

.label-space {
  height: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.625rem;
  flex-shrink: 0;
}

.label {
  margin-top: 0.25rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1;
  height: 0.75rem;
}

.month {
  color: #6b7280;
  text-align: center;
  line-height: 1;
  height: 0.625rem;
  margin-top: 0.125rem;
}

@media (max-width: 768px) {
  .stack {
    max-width: 16px;
  }
  
  .label {
    font-size: 0.5rem;
  }
}
</style>
