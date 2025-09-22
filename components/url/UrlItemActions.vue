<script setup lang="ts">
import type { UrlRecord } from "~/types/index"

interface Props {
  url: UrlRecord
}

interface Emits {
  openDetails: [url: UrlRecord]
  delete: [shortCode: string]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="url-actions">
    <BaseButton 
      :data-testid="`details-button-${url.shortCode}`"
      variant="secondary" 
      size="sm" 
      title="QR-Code & Bearbeiten" 
      class="action-button"
      @click="$emit('openDetails', url)"
    >
      <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
        />
      </svg>
      <span class="button-text">Details</span>
    </BaseButton>
    
    <BaseButton 
      :data-testid="`stats-button-${url.shortCode}`"
      variant="secondary" 
      size="sm" 
      title="Statistiken anzeigen"
      class="action-button"
      @click="$router.push(`/stats/${url.shortCode}`)"
    >
      <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span class="button-text">Statistiken</span>
    </BaseButton>
    
    <BaseButton 
      :data-testid="`delete-button-${url.shortCode}`"
      variant="danger" 
      size="sm" 
      title="URL löschen" 
      class="action-button"
      @click="$emit('delete', url.shortCode)"
    >
      <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      <span class="button-text">Löschen</span>
    </BaseButton>
  </div>
</template>

<style scoped>
.url-actions {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

@media (min-width: 900px) {
  .url-actions {
    flex-direction: column;
  }
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-start;
  min-width: 120px;
}

.action-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.button-text {
  display: inline;
}

@media (max-width: 479px) {
  .button-text {
    display: none;
  }
  
  .action-button {
    min-width: auto;
    padding: 0.5rem;
  }
}
</style>
