<script setup lang="ts">
const route = useRoute()
const shortCode = route.params.shortCode as string

usePublicPage(`Redirect - ${shortCode}`)

// Server-seitiger Redirect - passiert vor dem Rendern der Seite
try {
  const useUrlsModule = await import("~/server/useUrls")
  const { getUrlByShortCode, recordUrlAccess } = useUrlsModule.default()
  
  const url = await getUrlByShortCode(shortCode)
  
  if (!url) {
    throw createError({
      statusCode: 404,
      statusMessage: "Short-URL nicht gefunden",
    })
  }

  if (import.meta.server) {
    try {
      const event = useRequestEvent()
      if (event) {
        const { getClientIP, getUserAgent, getReferrer } = await import("~/utils/apiAuth")
        await recordUrlAccess(shortCode, getClientIP(event), getUserAgent(event), getReferrer(event))
      }
    } catch {
      // Click-Tracking-Fehler sollen Redirect nicht blockieren
    }
  }

  await navigateTo(url.originalUrl, { external: true })
} catch (error) {
  if (error && typeof error === "object" && "statusCode" in error) {
    throw error
  }
  throw createError({
    statusCode: 404,
    statusMessage: "Short-URL nicht gefunden",
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
