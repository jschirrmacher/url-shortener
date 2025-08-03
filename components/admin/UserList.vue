<script setup lang="ts">
import type { User } from "~/types/index"

// Props & Emits
interface Props {
  users: User[]
  loading?: boolean
  error?: string
}

interface Emits {
  (e: "refresh"): void
  (e: "userDeleted", username: string): void
  (e: "userReactivated", username: string): void
  (e: "roleChanged", username: string, newRole: "admin" | "user"): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: "",
})

const emit = defineEmits<Emits>()

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// User Actions
const deleteUser = async (username: string): Promise<void> => {
  if (!confirm(`Benutzer "${username}" wirklich löschen?`)) return

  try {
    await $fetch(`/api/admin/users/${username}`, {
      method: "DELETE",
    })
    emit("userDeleted", username)
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    alert(apiError?.data?.message ?? apiError?.message ?? "Fehler beim Löschen des Benutzers")
  }
}

const reactivateUser = async (username: string): Promise<void> => {
  try {
    await $fetch(`/api/admin/users/${username}/reactivate`, {
      method: "POST",
    })
    emit("userReactivated", username)
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    alert(apiError?.data?.message ?? apiError?.message ?? "Fehler beim Reaktivieren des Benutzers")
  }
}

const changeRole = async (username: string, newRole: "admin" | "user"): Promise<void> => {
  if (!confirm(`Rolle von "${username}" zu "${newRole}" ändern?`)) return

  try {
    await $fetch(`/api/admin/users/${username}/role`, {
      method: "PUT",
      body: { role: newRole },
    })
    emit("roleChanged", username, newRole)
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    alert(apiError?.data?.message ?? apiError?.message ?? "Fehler beim Ändern der Rolle")
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">Benutzer-Verwaltung</h2>
      <button
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        @click="emit('refresh')"
      >
        {{ loading ? "Lädt..." : "Aktualisieren" }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">❌ {{ error }}</div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      <p class="mt-2 text-gray-600">Lade Benutzer...</p>
    </div>

    <!-- Users Table -->
    <div v-else-if="users.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benutzer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.username" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                :value="user.role"
                class="text-sm border border-gray-300 rounded px-2 py-1"
                @change="changeRole(user.username, ($event.target as HTMLSelectElement).value as 'admin' | 'user')"
              >
                <option value="user">Benutzer</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                ]"
              >
                {{ user.active ? "Aktiv" : "Deaktiviert" }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
              <button
                v-if="user.active"
                class="text-red-600 hover:text-red-900 transition-colors"
                @click="deleteUser(user.username)"
              >
                Deaktivieren
              </button>
              <button
                v-else
                class="text-green-600 hover:text-green-900 transition-colors"
                @click="reactivateUser(user.username)"
              >
                Reaktivieren
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <p class="text-gray-500">Keine Benutzer gefunden</p>
    </div>
  </div>
</template>
