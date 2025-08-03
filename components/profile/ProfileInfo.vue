<script setup lang="ts">
import type { User } from "~/types/index"

// Props
interface Props {
  user: User | null
}

const props = defineProps<Props>()

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getRoleLabel = (role: string): string => {
  return role === "admin" ? "Administrator" : "Benutzer"
}

const getRoleBadgeColor = (role: string): string => {
  return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">Profil-Informationen</h2>

    <div v-if="user" class="space-y-4">
      <!-- User Avatar & Name -->
      <div class="flex items-center space-x-4">
        <div class="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ user.username }}</h3>
          <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getRoleBadgeColor(user.role)]">
            {{ getRoleLabel(user.role) }}
          </span>
        </div>
      </div>

      <!-- User Details -->
      <div class="border-t border-gray-200 pt-4">
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Benutzername</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ user.username }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Rolle</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ getRoleLabel(user.role) }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Mitglied seit</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.createdAt) }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Status</dt>
            <dd class="mt-1">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                ]"
              >
                {{ user.active ? "Aktiv" : "Deaktiviert" }}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <!-- Quick Actions -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-500 mb-3">Schnellzugriff</h4>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            to="/"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Meine URLs
          </NuxtLink>

          <NuxtLink
            v-if="user.role === 'admin'"
            to="/admin"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            Administration
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      <p class="mt-2 text-gray-600">Lade Profil-Informationen...</p>
    </div>
  </div>
</template>
