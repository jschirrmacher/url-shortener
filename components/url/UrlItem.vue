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
      <UrlItemInfo :url="url" :short-url="getShortUrl(url.shortCode)" />
      
      <!-- Admin Owner Display/Change -->
      <div v-if="isAdmin && allUsers.length > 0" class="admin-owner-section">
        <label class="owner-label">Eigentümer:</label>
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
      
      <UrlItemActions 
        v-if="showActions"
        :url="url"
        @open-details="emit('openDetails', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </article>
</template>

<style scoped>
.url-item {
  background-color: #ffffff;
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
  align-items: flex-start;
}

.admin-owner-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.owner-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.owner-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background-color: white;
  min-width: 120px;
}

.owner-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
</style>

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
