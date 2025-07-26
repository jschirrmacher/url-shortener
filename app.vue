<template>
  <div class="min-h-screen bg-gray-100">
    <NuxtPage />
  </div>
</template>

<script setup>
// Global Meta
useHead({
  titleTemplate: '%s | URL-Shortener',
  meta: [
    { name: 'description', content: 'URL-Shortener mit Analytics und CSV-Speicher' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>
