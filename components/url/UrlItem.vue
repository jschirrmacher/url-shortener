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

withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<Emits>()

function getShortUrl(shortCode: string) {
  const { $config } = useNuxtApp()
  const baseUrl = $config.public.baseUrl || "http://localhost:3000"
  return `${baseUrl}/${shortCode}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
</script>

<template>
  <article class="url-item" :data-testid="`url-item-${url.shortCode}`">
    <div class="url-content">
      <!-- Column 1: URL Info (without metadata) -->
      <div class="url-info-column">
        <UrlItemInfo :url="url" :short-url="getShortUrl(url.shortCode)" :show-metadata="false" />
      </div>
      
      <!-- Column 2: Stats + Metadata -->
      <div class="meta-column">
        <!-- Stats -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ url.totalClicks ?? 0 }}</span>
              <span class="stat-label">Klicks</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ url.uniqueVisitors ?? 0 }}</span>
              <span class="stat-label">Besucher</span>
            </div>
          </div>
        </div>
        
        <!-- Metadata -->
        <div class="metadata-section">
          <label class="metadata-label">Erstellt</label>
          <div class="metadata-content">
            {{ formatDate(url.createdAt) }}
          </div>
        </div>
      </div>
      
      <!-- Column 3: Actions -->
      <div v-if="showActions" class="actions-column">
        <UrlItemActions 
          :url="url"
          @open-details="emit('openDetails', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.url-item {
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
  transition: box-shadow 150ms;
}

.url-item:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.url-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 900px) {
  .url-content {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 2rem;
    align-items: start;
  }
}

.url-info-column {
  flex: 1;
}

.meta-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 150px;
}

@media (min-width: 480px) and (max-width: 899px) {
  .meta-column {
    flex-direction: row;
    gap: 2rem;
    align-items: flex-start;
  }
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stats-grid {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.owner-section,
.metadata-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 480px) and (max-width: 899px) {
  .owner-section,
  .metadata-section {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
}

.owner-label,
.metadata-label {
  font-size: 0.875rem;
  color: #374151;
}

.metadata-content {
  font-size: 0.875rem;
  color: #6b7280;
}

.created-by {
  font-size: 0.75rem;
  color: #9ca3af;
}

.actions-column {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: flex-end;
}

@media (min-width: 900px) {
  .actions-column {
    flex-direction: column;
    justify-content: center;
  }
}
</style>
