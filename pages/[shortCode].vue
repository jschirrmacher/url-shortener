<script setup lang="ts">
const route = useRoute()
const shortCode = route.params.shortCode as string

usePublicPage(`Redirect - ${shortCode}`)

// Server-seitiger Redirect über die bestehende API
if (import.meta.server) {
  // Server-seitiger Redirect - nutze die bestehende redirect API
  await navigateTo(`/api/redirect/${shortCode}`, { external: true })
} else {
  // Client-seitiger Fallback (sollte normalerweise nicht erreicht werden)
  onMounted(async () => {
    try {
      // Direkte Weiterleitung zur API - Browser folgt dem 302 Redirect
      window.location.href = `/api/redirect/${shortCode}`
    } catch {
      // Bei Fehlern zur Fehlerseite
      throw createError({ 
        statusCode: 404, 
        statusMessage: "Short-URL nicht gefunden" 
      })
    }
  })
}
</script>

<template>
  <!-- Diese Seite sollte nie angezeigt werden, da der Redirect vorher passiert -->
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p class="text-gray-600">Weiterleitung...</p>
    </div>
  </div>
</template>
