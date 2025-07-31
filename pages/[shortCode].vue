<script setup lang="ts">
const route = useRoute()
const shortCode = route.params.shortCode as string

usePublicPage(`Redirect - ${shortCode}`)

const { pending, error } = await useLazyFetch(`/api/redirect/${shortCode}`, {
  server: false,
  onResponse({ response }) {
    // Bei erfolgreichem Response wird automatisch weitergeleitet
    if (response.status === 302) {
      window.location.href = response.headers.get("location") || "/"
    }
  },
  onResponseError({ response }) {
    console.error("Redirect error:", response.status, response.statusText)
  },
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <div v-if="pending" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600">Weiterleitung wird vorbereitet...</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="text-6xl mb-4">❌</div>
        <h1 class="text-2xl font-bold text-gray-800">Short-URL nicht gefunden</h1>
        <p class="text-gray-600">Die angeforderte Short-URL existiert nicht oder ist nicht mehr verfügbar.</p>
        <NuxtLink to="/" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Zur Startseite
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zusätzliche Styles falls nötig */
</style>
