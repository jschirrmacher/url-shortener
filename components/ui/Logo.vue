<script setup lang="ts">
const { isDark } = useTheme()

const colors = computed(() => {
  return isDark.value ? {
    chain: '#60a5fa',
    text: '#ffffff',
    subtext: '#e5e7eb'
  } : {
    chain: '#2563eb',
    text: '#1f2937',
    subtext: '#6b7280'
  }
})
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60" class="logo">
    <!-- Erstes Kettenglied (versetzt nach oben) -->
    <ellipse 
      cx="20" cy="22" rx="10" ry="14" 
      fill="none" :stroke="colors.chain" stroke-width="3" 
      stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Zweites Kettenglied (versetzt nach unten) -->
    <ellipse 
      cx="35" cy="32" rx="10" ry="14"
      fill="none" :stroke="colors.chain" stroke-width="3" 
      stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Logo Text -->
    <text 
      x="55" y="28" 
      class="logo-title"
      font-weight="600" font-size="24" :fill="colors.text">URL</text>
    <text 
      x="55" y="48"
      class="logo-subtitle"
      font-weight="400" font-size="16" :fill="colors.subtext">Shortener</text>
  </svg>
</template>

<style scoped>
.logo {
  display: block;
}

.logo-title,
.logo-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
