<script setup lang="ts">
import type { UrlRecord } from "~/types/index"

const { user } = useAuthPageStandard("URL Shortener - Dashboard")
const usersStore = useUsersStore()

// Admin check
const isAdmin = computed(() => user.value?.role === "admin")

// Reactive Data
const urls = ref<UrlRecord[]>([])
const urlsLoading = ref(false)
const urlsError = ref("")
const selectedUser = ref("all")

// Computed filtered URLs
const filteredUrls = computed(() => {
  if (!isAdmin.value || selectedUser.value === "all") {
    return urls.value
  }
  return urls.value.filter(url => url.createdBy === selectedUser.value)
})

// Active users for admin dropdown
const activeUsers = computed(() => usersStore.users.filter(u => u.active))

onMounted(async () => {
  await loadUrls()
  if (isAdmin.value) {
    await usersStore.loadUsers()
  }
})

// Load URLs (all for admin, own for users)
async function loadUrls() {
  try {
    urlsLoading.value = true
    urlsError.value = ""

    urls.value = await $fetch<UrlRecord[]>("/api/urls")
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    urlsError.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Laden der URLs"
  } finally {
    urlsLoading.value = false
  }
}

// URL Creation State
const createLoading = ref(false)
const createError = ref("")
const createSuccess = ref(false)
const createSuccessMessage = ref("")

// Auto-hide success message after 5 seconds
watch(createSuccess, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      createSuccess.value = false
      createSuccessMessage.value = ""
    }, 5000)
  }
})

// Event Handlers
async function handleUrlChanged(data: { shortCode: string; originalUrl: string; title: string; owner?: string }) {
  createLoading.value = true
  createError.value = ""
  createSuccess.value = false

  try {
    const response = await $fetch("/api/urls", {
      method: "POST",
      body: {
        originalUrl: data.originalUrl,
        customCode: data.shortCode || undefined,
        title: data.title || undefined,
        owner: data.owner || undefined
      }
    })

    createSuccess.value = true
    createSuccessMessage.value = `Kurz-URL erstellt: ${response.shortUrl}`
    
    // Reload URLs
    await loadUrls()
  } catch (error) {
    const apiError = error as { data?: { message?: string }; message?: string }
    createError.value = apiError?.data?.message || apiError?.message || "Fehler beim Erstellen der URL"
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-4 px-4">
    <div class="space-y-6">
      <!-- Success message -->
      <AlertMessage
        v-if="createSuccess"
        type="success"
        title="URL erfolgreich erstellt"
        :message="createSuccessMessage"
      />

      <!-- Error message -->
      <AlertMessage
        v-if="createError"
        type="error"
        title="Fehler"
        :message="createError"
      />

      <!-- URL Create Form -->
      <UrlForm @changed="handleUrlChanged" />
      
      <!-- URLs List -->
      <UrlList
        :urls="filteredUrls"
        :loading="urlsLoading"
        :error="urlsError"
        :is-admin="isAdmin"
        :all-users="activeUsers"
        :selected-user="selectedUser"
        @refresh="loadUrls"
        @updated="loadUrls"
        @user-changed="selectedUser = $event"
      />
    </div>
  </div>
</template>

<style scoped>
/* Page styles */
</style>

