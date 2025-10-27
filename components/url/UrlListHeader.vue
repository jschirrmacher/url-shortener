<script setup lang="ts">
import type { User } from "~/types/index"

interface Props {
  loading: boolean
  isAdmin?: boolean
  allUsers?: User[]
  selectedUser?: string
}

interface Emits {
  refresh: []
  userChanged: [username: string]
}

const props = withDefaults(defineProps<Props>(), {
  isAdmin: false,
  allUsers: () => [],
  selectedUser: "all"
})
defineEmits<Emits>()

function getTitle() {
  if (!props.isAdmin) return "Meine URLs"
  if (props.selectedUser === "all") return "Alle URLs"
  return `URLs von ${props.selectedUser}`
}
</script>

<template>
  <header class="url-list-header">
    <ClientOnly>
      <h2>{{ getTitle() }}</h2>
      <template #fallback>
        <h2>Meine URLs</h2>
      </template>
    </ClientOnly>
    
    <div class="header-actions">
      <!-- Admin Filter -->
      <ClientOnly>
        <div v-if="isAdmin" class="admin-filter">
          <label for="user-filter" class="filter-label">Benutzer:</label>
          <select 
            id="user-filter" 
            :value="selectedUser" 
            class="filter-select"
            @change="$emit('userChanged', ($event.target as HTMLSelectElement).value)"
          >
            <option value="all">Alle Benutzer</option>
            <option 
              v-for="userItem in allUsers" 
              :key="userItem.username"
              :value="userItem.username"
            >
              {{ userItem.username }}
            </option>
          </select>
        </div>
      </ClientOnly>
      
      <BaseButton variant="primary" :disabled="loading" :loading="loading" @click="$emit('refresh')">
        {{ loading ? "Lädt..." : "Aktualisieren" }}
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.url-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.url-list-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
</style>
