<script setup lang="ts">
import type { UrlRecord, User } from "~/types/index"

const { user } = useAuthPageStandard("URL Shortener - Dashboard")

// Admin check
const isAdmin = computed(() => user.value?.role === "admin")

// Reactive Data
const urls = ref<UrlRecord[]>([])
const allUsers = ref<User[]>([])
const urlsLoading = ref<boolean>(true)
const urlsError = ref<string>("")
const selectedUser = ref<string>("all")

// Computed filtered URLs
const filteredUrls = computed(() => {
  if (!isAdmin.value || selectedUser.value === "all") {
    return urls.value
  }
  return urls.value.filter(url => url.createdBy === selectedUser.value)
})

onMounted(async (): Promise<void> => {
  await loadUrls()
  if (isAdmin.value) {
    await loadUsers()
  }
})

// Load URLs (all for admin, own for users)
const loadUrls = async (): Promise<void> => {
  try {
    urlsLoading.value = true
    urlsError.value = ""

    const endpoint = isAdmin.value ? "/api/admin/urls" : "/api/urls"
    const response = await $fetch<UrlRecord[]>(endpoint)
    urls.value = response
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    urlsError.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Laden der URLs"
  } finally {
    urlsLoading.value = false
  }
}

// Load Users (admin only)
const loadUsers = async (): Promise<void> => {
  try {
    const response = await $fetch<User[]>("/api/admin/users")
    allUsers.value = response.filter(u => u.active)
  } catch (err) {
    console.error("Failed to load users:", err)
  }
}

// Change URL owner (admin only)
const changeUrlOwner = async (shortCode: string, newOwner: string): Promise<void> => {
  try {
    await $fetch(`/api/admin/urls/${shortCode}/owner`, {
      method: "PUT",
      body: { newOwner }
    })
    
    // Update local data
    const urlIndex = urls.value.findIndex(url => url.shortCode === shortCode)
    if (urlIndex !== -1) {
      urls.value[urlIndex]!.createdBy = newOwner
    }
  } catch (err) {
    console.error("Failed to change owner:", err)
    throw err
  }
}

// Event Handlers
const handleUrlCreated = (_data: { shortCode: string; shortUrl: string }): void => {
  loadUrls()
}

const handleUrlsRefresh = (): void => {
  loadUrls()
}

const handleOwnerChange = async (shortCode: string, newOwner: string): Promise<void> => {
  try {
    await changeUrlOwner(shortCode, newOwner)
  } catch (err) {
    console.error("Failed to change owner:", err)
    // Reload to revert changes
    await loadUrls()
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
          <ClientOnly>
            <p class="text-gray-600 mt-2">{{ isAdmin ? 'Admin-Ansicht - Alle URLs verwalten' : 'Verwalten Sie Ihre Kurz-URLs' }}</p>
            <template #fallback>
              <p class="text-gray-600 mt-2">Verwalten Sie Ihre Kurz-URLs</p>
            </template>
          </ClientOnly>
        </div>
        
        <!-- Admin Filter -->
        <ClientOnly>
          <div v-if="isAdmin" class="admin-filter">
            <label for="user-filter" class="filter-label">Benutzer filtern:</label>
            <select id="user-filter" v-model="selectedUser" class="filter-select">
              <option value="all">Alle Benutzer</option>
              <option 
                v-for="user in allUsers" 
                :key="user.username"
                :value="user.username"
              >
                {{ user.username }}
              </option>
            </select>
          </div>
        </ClientOnly>
      </div>
    </div>
    <div class="space-y-6">
      <!-- URL Create Form -->
      <UrlCreateForm @url-created="handleUrlCreated" />
      <!-- URLs List -->
      <UrlList
        :urls="filteredUrls"
        :loading="urlsLoading"
        :error="urlsError"
        :is-admin="isAdmin"
        :all-users="allUsers"
        @refresh="handleUrlsRefresh"
        @updated="handleUrlsRefresh"
        @change-owner="handleOwnerChange"
      />
    </div>
  </div>
</template>

<style scoped>
.admin-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
</style>
