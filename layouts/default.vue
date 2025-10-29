<script setup lang="ts">
// Auth für globales Layout
const { user } = useAuth()
</script>

<template>
  <div class="layout-container">
    <!-- Global Header -->
    <header class="layout-header">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="logo-link">
              <Logo class="h-12 w-auto" />
            </NuxtLink>
            <BaseButton 
              v-if="$route.path !== '/' && $route.path !== '/login'" 
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
              <NuxtLink v-else-if="$route.path !== '/login'" to="/login" class="login-button">
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
.layout-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.layout-header {
  padding: 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
}

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
