<script setup lang="ts">
const route = useRoute()
const shortCode = route.params.shortCode as string

usePublicPage(`Redirect - ${shortCode}`)

// Meta-Refresh für sofortigen Redirect ohne JavaScript
const redirectUrl = `/api/redirect/${shortCode}`

// Server-seitiger Meta-Refresh
useHead({
  meta: [
    {
      'http-equiv': 'refresh',
      content: `0; url=${redirectUrl}`
    }
  ]
})

// Zusätzlicher JavaScript-Fallback für sofortigen Redirect
if (import.meta.client) {
  // Verwende setTimeout um sicherzustellen, dass es nach dem Rendering passiert
  setTimeout(() => {
    document.location.href = redirectUrl
  }, 0)
}
</script>

<template>
  <!-- Minimale Seite mit Redirect-Info -->
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      <p class="text-gray-600 text-sm">Weiterleitung...</p>
      <noscript>
        <p class="text-gray-500 text-xs">
          Falls die automatische Weiterleitung nicht funktioniert: 
          <a :href="redirectUrl" class="text-blue-600 underline">Hier klicken</a>
        </p>
      </noscript>
    </div>
  </div>
</template>
