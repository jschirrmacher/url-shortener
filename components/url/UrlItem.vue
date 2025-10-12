<script setup lang="ts">
import type { UrlRecord } from "~/types/index"

interface Props {
  url: UrlRecord
  showActions?: boolean
  isAdmin?: boolean
  allUsers?: User[]
}

interface Emits {
  openDetails: [url: UrlRecord]
  delete: [shortCode: string]
  changeOwner: [shortCode: string, newOwner: string]
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  isAdmin: false,
  allUsers: () => []
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

function handleOwnerChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newOwner = target.value
  if (newOwner !== props.url.createdBy) {
    emit('changeOwner', props.url.shortCode, newOwner)
  }
}
</script>

<template>
  <article class="url-item" :data-testid="`url-item-${url.shortCode}`">
    <div class="url-content">
      <!-- Column 1: URL Info (without metadata) -->
      <div class="url-info-column">
        <UrlItemInfo :url="url" :short-url="getShortUrl(url.shortCode)" :show-metadata="false" />
      </div>
      
      <!-- Column 2: Owner + Metadata -->
      <div class="meta-column">
        <!-- Owner (Admin only) -->
        <div v-if="isAdmin && allUsers.length > 0" class="owner-section">
          <label class="owner-label">Eigentümer</label>
          <select 
            class="owner-select"
            :value="url.createdBy"
            @change="handleOwnerChange($event)"
          >
            <option 
              v-for="user in allUsers" 
              :key="user.username"
              :value="user.username"
            >
              {{ user.username }}
            </option>
          </select>
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

.owner-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
}

.owner-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
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
