<script setup lang="ts">
import type { UrlRecord } from "~/types/index"

interface Props {
  url: UrlRecord
  showActions?: boolean
}

interface Emits {
  openDetails: [url: UrlRecord]
  delete: [shortCode: string]
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})
defineEmits<Emits>()

function getShortUrl(shortCode: string) {
  const { $config } = useNuxtApp()
  const baseUrl = $config.public.baseUrl || "http://localhost:3000"
  return `${baseUrl}/${shortCode}`
}
</script>

<template>
  <article class="url-item" :data-testid="`url-item-${url.shortCode}`">
    <div class="url-content">
      <UrlItemInfo :url="url" :short-url="getShortUrl(url.shortCode)" />
      <UrlItemActions 
        v-if="showActions"
        :url="url"
        @open-details="$emit('openDetails', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </article>
</template>

<style scoped>
.url-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: box-shadow 150ms;
}

.url-item:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.url-content {
  display: flex;
  gap: 1rem;
}

@media (max-width: 767px) {
  .url-content {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (min-width: 768px) {
  .url-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
