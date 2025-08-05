<script setup lang="ts">
const route = useRoute()
const shortCode = route.params.shortCode as string

usePublicPage(`Redirect - ${shortCode}`)

// Sofortiger Redirect ohne CORS-Probleme
// Verwende window.location.replace für sofortigen Redirect ohne History-Eintrag
if (import.meta.client) {
  // Sofortiger Client-seitiger Redirect
  window.location.replace(`/api/redirect/${shortCode}`)
}
</script>

<template>
  <!-- Minimale Seite - wird nur sehr kurz angezeigt -->
  <div />
</template>
