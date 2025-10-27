<script setup lang="ts">
// Auth für globales Layout
const { user } = useAuth()

const currentTheme = ref<'light' | 'dark'>('light')

onMounted(() => {
  const updateTheme = () => {
    const classList = document.documentElement.classList
    if (classList.contains('dark')) {
      currentTheme.value = 'dark'
    } else if (classList.contains('light')) {
      currentTheme.value = 'light'
    } else {
      currentTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  }
  
  updateTheme()
  
  // Observer für Klassen-Änderungen
  const observer = new MutationObserver(updateTheme)
  observer.observe(document.documentElement, { 
    attributes: true, 
    attributeFilter: ['class'] 
  })
  
  // Media Query Listener
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', updateTheme)
  
  onUnmounted(() => {
    observer.disconnect()
    mediaQuery.removeEventListener('change', updateTheme)
  })
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Global Header -->
    <header class="container-primary shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="logo-link">
              <Logo :theme="currentTheme" class="h-12 w-auto" />
            </NuxtLink>
            <BaseButton 
              v-if="$route.path !== '/'" 
              variant="ghost"
              size="sm"
              @click="$router.back()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Zurück
            </BaseButton>
          </div>

          <!-- Right side content -->
          <div>
            <!-- User Menu und Login Button nur client-side -->
            <ClientOnly>
              <!-- User Menu (für eingeloggte Benutzer) -->
              <UserMenu v-if="user" />

              <!-- Login Button (für nicht-eingeloggte Benutzer) -->
              <NuxtLink v-else to="/login" class="login-button">
                Anmelden
              </NuxtLink>

              <!-- Fallback während Hydration -->
              <template #fallback>
                <div class="px-4 py-2 bg-gray-200 text-gray-500 rounded-md animate-pulse">Laden...</div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Layout-spezifische Styles */
.logo-link {
  display: flex;
  align-items: center;
  transition: opacity 0.15s ease-in-out;
}

.logo-link:hover {
  opacity: 0.8;
}

.login-button {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: background-color 0.15s ease-in-out;
}

.login-button:hover {
  background-color: #1d4ed8;
}
</style>
