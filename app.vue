<script setup lang="ts">
// Global Meta
useHead({
  titleTemplate: '%s | URL-Shortener',
  meta: [
    {
      name: 'description',
      content: 'URL-Shortener mit Analytics und CSV-Speicher',
    },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Global Styles falls nötig */
</style>
