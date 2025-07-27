<script setup lang="ts">
import type { UrlRecord } from '~/types/index'

// Meta
useHead({
  title: 'URL Shortener - Dashboard',
})

// Auth Check
const { user, initAuth } = useAuth()

onMounted(async (): Promise<void> => {
  await initAuth()
  if (!user.value) {
    await navigateTo('/login')
    return
  }

  // Lade URLs nach erfolgreicher Auth
  await loadUrls()
})

// Reactive Data
const urls = ref<UrlRecord[]>([])
const urlsLoading = ref<boolean>(true)
const urlsError = ref<string>('')

// Load URLs
const loadUrls = async (): Promise<void> => {
  try {
    urlsLoading.value = true
    urlsError.value = ''

    const response = await $fetch<UrlRecord[]>('/api/urls')
    urls.value = response
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    urlsError.value = apiError?.data?.message ?? apiError?.message ?? 'Fehler beim Laden der URLs'
  } finally {
    urlsLoading.value = false
  }
}

// Event Handlers
const handleUrlCreated = (data: { shortCode: string; shortUrl: string }): void => {
  // Reload URLs to get the new one
  loadUrls()
}

const handleUrlsRefresh = (): void => {
  loadUrls()
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-600 mt-2">Verwalten Sie Ihre Kurz-URLs</p>
    </div>

    <div class="space-y-6">
      <!-- URL Create Form -->
      <UrlCreateForm @url-created="handleUrlCreated" />

      <!-- URLs List -->
      <UrlList
        :urls="urls"
        :loading="urlsLoading"
        :error="urlsError"
        @refresh="handleUrlsRefresh"
        @url-updated="handleUrlsRefresh"
      />
    </div>
  </div>
</template>
