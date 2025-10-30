<script setup lang="ts">
const router = useRouter()
const route = useRoute()

// Navigation-Richtung verwalten
const isBackNavigation = ref(false)
const navigationStack = ref<string[]>([])

// Initialer Stack mit aktueller Route
onMounted(() => {
  if (route.path) {
    navigationStack.value.push(route.path)
  }
})

// Transition-Name basierend auf Richtung
const transitionName = computed(() => {
  return isBackNavigation.value ? 'page-back' : 'page'
})

// Router-Navigation überwachen
router.beforeEach((to) => {
  const toPath = to.path
  
  // Automatische Erkennung für Browser-Zurück
  const lastIndex = navigationStack.value.lastIndexOf(toPath)
  const isBack = lastIndex !== -1 && lastIndex < navigationStack.value.length - 1
  
  isBackNavigation.value = isBack
  
  if (isBack) {
    navigationStack.value = navigationStack.value.slice(0, lastIndex + 1)
  } else if (!navigationStack.value.includes(toPath)) {
    navigationStack.value.push(toPath)
  }
})

// Globale Funktion für explizite Zurück-Navigation
provide('goBack', () => {
  isBackNavigation.value = true
  router.back()
})

// Global Meta
useHead({
  titleTemplate: "%s | URL-Shortener",
  meta: [
    {
      name: "description",
      content: "URL-Shortener mit Analytics und CSV-Speicher",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
})
</script>

<template>
  <div class="page-wrapper">
    <NuxtLayout>
      <NuxtPage :transition="{ name: transitionName, mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<style>
/* Global Styles */
body {
  margin: 0;
  overflow-x: hidden;
}

/* Layout für Transitions */
.page-wrapper {
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
}

/* Page Transitions - Swipe Effects */
.page-enter-active,
.page-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Vorwärts Navigation */
.page-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.page-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Zurück Navigation */
.page-back-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.page-back-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.page-enter-to,
.page-leave-from,
.page-back-enter-to,
.page-back-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Mobile optimierte Swipe-Animationen */
@media (max-width: 768px) {
  .page-enter-active,
  .page-leave-active,
  .page-back-enter-active,
  .page-back-leave-active {
    transition: transform 0.25s ease-out, opacity 0.25s ease-out;
  }
}
</style>
