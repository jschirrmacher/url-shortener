<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <div v-if="pending" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600">Weiterleitung wird vorbereitet...</p>
      </div>
      
      <div v-else-if="error" class="space-y-4">
        <div class="text-6xl">❌</div>
        <h1 class="text-2xl font-bold text-gray-800">URL nicht gefunden</h1>
        <p class="text-gray-600">Der angeforderte Short Code existiert nicht.</p>
        <NuxtLink to="/" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Zur Startseite
        </NuxtLink>
      </div>
      
      <div v-else-if="data" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600">Weiterleitung zu {{ data.redirectUrl }}...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Route Parameter
const route = useRoute()
const shortCode = route.params.shortCode

// Meta
useHead({
  title: `Weiterleitung - ${shortCode}`
})

// Data Fetching
const { data, pending, error } = await useLazyFetch(`/api/redirect/${shortCode}`, {
  headers: {
    'Accept': 'application/json'
  }
})

// Client-seitige Weiterleitung
onMounted(() => {
  if (data.value && data.value.redirectUrl) {
    window.location.href = data.value.redirectUrl
  }
})

// Watch für spätere Datenänderungen
watch(data, (newData) => {
  if (newData && newData.redirectUrl) {
    window.location.href = newData.redirectUrl
  }
})
</script>
