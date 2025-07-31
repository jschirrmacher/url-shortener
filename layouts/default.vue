<script setup lang="ts">
// Auth für globales Layout
const { user } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Global Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-xl font-bold text-gray-800 hover:text-orange-600"> 🔗 URL-Shortener </NuxtLink>
          </div>

          <!-- Right side content -->
          <div>
            <!-- User Menu und Login Button nur client-side -->
            <ClientOnly>
              <!-- User Menu (für eingeloggte Benutzer) -->
              <UserMenu v-if="user" />

              <!-- Login Button (für nicht-eingeloggte Benutzer) -->
              <NuxtLink v-else to="/login" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
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
</style>
