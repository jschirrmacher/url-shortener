<script setup lang="ts">
import { reactive } from "vue"
import type { UrlRecord, User } from "~/types/index"

interface Props {
  urls: UrlRecord[]
  loading: boolean
  error: string | null
  isAdmin?: boolean
  allUsers?: User[]
  selectedUser?: string
}

interface Emits {
  refresh: []
  updated: [url: UrlRecord]
  changeOwner: [shortCode: string, newOwner: string]
  userChanged: [username: string]
}

const props = withDefaults(defineProps<Props>(), {
  isAdmin: false,
  allUsers: () => [],
  selectedUser: "all"
})
const emit = defineEmits<Emits>()

// State für Delete-Funktionalität
const state = reactive({
  deleteError: null as string | null,
})

// Unified Modal State
const unifiedModal = reactive({
  isOpen: false,
  shortCode: "",
  shortUrl: "",
  originalUrl: "",
  title: "",
  currentOwner: "",
})

function getSortedUrls() {
  return [...props.urls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function openUnifiedModal(url: UrlRecord) {
  const { $config } = useNuxtApp()
  const baseUrl = $config.public.baseUrl || "http://localhost:3000"
  
  unifiedModal.shortCode = url.shortCode
  unifiedModal.shortUrl = `${baseUrl}/${url.shortCode}`
  unifiedModal.originalUrl = url.originalUrl
  unifiedModal.title = url.title || ""
  unifiedModal.currentOwner = url.createdBy
  unifiedModal.isOpen = true
}

function closeUnifiedModal() {
  unifiedModal.isOpen = false
  unifiedModal.shortCode = ""
  unifiedModal.shortUrl = ""
  unifiedModal.originalUrl = ""
  unifiedModal.title = ""
  unifiedModal.currentOwner = ""
}

function handleUrlUpdated(url: UrlRecord) {
  emit("updated", url)
}

async function deleteUrl(shortCode: string) {
  if (!confirm("Sind Sie sicher, dass Sie diese URL löschen möchten?")) {
    return
  }

  try {
    state.deleteError = null
    const { error } = await useFetch(`/api/urls/${shortCode}`, {
      method: "DELETE",
    })

    if (error.value) {
      throw error.value
    }

    // Refresh the list
    emit("refresh")
  } catch (err) {
    const errorObj = err as Error & { data?: { message?: string } }
    state.deleteError = errorObj?.data?.message ?? errorObj?.message ?? "Fehler beim Löschen der URL"
  }
}
</script>

<template>
  <div class="url-list-container">
    <UrlListHeader 
      :loading="loading" 
      :is-admin="isAdmin"
      :all-users="allUsers"
      :selected-user="selectedUser"
      @refresh="emit('refresh')" 
      @user-changed="emit('userChanged', $event)"
    />
    
    <!-- Error Messages -->
    <div v-if="error" class="error-message">❌ {{ error }}</div>
    <div v-if="state.deleteError" class="error-message">❌ {{ state.deleteError }}</div>
    
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="Lade URLs..." />
    
    <!-- URLs Grid -->
    <div v-else-if="urls.length > 0" class="urls-grid">
      <UrlItem
        v-for="url in getSortedUrls()"
        :key="url.shortCode"
        :url="url"
        :is-admin="isAdmin"
        :all-users="allUsers"
        @open-details="openUnifiedModal"
        @delete="deleteUrl"
        @change-owner="(shortCode: string, newOwner: string) => $emit('changeOwner', shortCode, newOwner)"
      />
    </div>
    
    <!-- Empty State -->
    <EmptyState 
      v-else 
      title="Noch keine URLs erstellt"
      description="Erstellen Sie Ihre erste Kurz-URL oben."
      icon="link"
    />
  </div>
  
  <!-- Details Modal -->
  <UrlDetailsModal
    :data="unifiedModal"
    :is-admin="isAdmin"
    :all-users="allUsers"
    @close="closeUnifiedModal"
    @updated="handleUrlUpdated"
    @change-owner="(shortCode: string, newOwner: string) => $emit('changeOwner', shortCode, newOwner)"
  />
</template>

<style scoped>
.url-list-container {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}

.error-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #f87171;
  color: #b91c1c;
  border-radius: 0.25rem;
}

.urls-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .url-list-container {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  }
  
  .error-message {
    background-color: #7f1d1d;
    border-color: #dc2626;
    color: #fca5a5;
  }
}
</style>
