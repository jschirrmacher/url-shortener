<script setup lang="ts">
import type { UrlRecord } from "~/types/index"

interface Props {
  url: UrlRecord
  shortUrl: string
}

defineProps<Props>()

const { copyToClipboard } = useClipboard()

function truncateUrl(url: string, maxLength = 50) {
  return url.length > maxLength ? url.substring(0, maxLength) + "..." : url
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
  <div class="url-info">
    <div class="url-header">
      <h3>{{ url.title || "Unbenannte URL" }}</h3>
      <span class="short-code-badge">{{ url.shortCode }}</span>
    </div>
    
    <div class="url-details">
      <div class="url-row">
        <span class="label">Kurz-URL:</span>
        <BaseButton
          :data-testid="`copy-button-${url.shortCode}`"
          variant="ghost"
          size="sm"
          :title="shortUrl"
          class="copy-button"
          @click="copyToClipboard(shortUrl)"
        >
          <span>{{ shortUrl }}</span>
          <svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </BaseButton>
      </div>
      
      <div class="url-row">
        <span class="label">Ziel:</span>
        <a
          :href="url.originalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="target-link"
          :title="url.originalUrl"
        >
          {{ truncateUrl(url.originalUrl) }}
          <svg class="external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
      
      <div class="metadata">
        Erstellt: {{ formatDate(url.createdAt) }}
        <span v-if="url.createdBy">von {{ url.createdBy }}</span>
        <span v-if="url.totalClicks !== undefined">• {{ url.totalClicks }} Klicks</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.url-info {
  flex: 1;
  min-width: 0;
}

.url-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.url-header h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.short-code-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #fed7aa;
  color: #9a3412;
  border-radius: 9999px;
  flex-shrink: 0;
}

.url-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.url-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: #6b7280;
  flex-shrink: 0;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-size: 0.875rem;
}

.copy-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.target-link {
  font-size: 0.875rem;
  color: #374151;
  text-decoration: none;
  transition: color 150ms;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.target-link:hover {
  color: #111827;
  text-decoration: underline;
}

.external-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.metadata {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
