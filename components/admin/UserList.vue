<script setup lang="ts">
import type { User } from "~/types/index"

interface Props {
  users: User[]
  loading: boolean
  error: string
}

interface Emits {
  (e: "refresh"): void
  (e: "userDeleted" | "userReactivated" | "passwordReset", username: string): void
  (e: "roleChanged", username: string, newRole: "admin" | "user"): void
}

const _props = defineProps<Props>()
const emit = defineEmits<Emits>()

const passwordResetModal = ref({
  isOpen: false,
  username: "",
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

async function deleteUser(username: string): Promise<void> {
  if (!confirm(`Möchten Sie den Benutzer "${username}" wirklich deaktivieren?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/users/${username}`, {
      method: "DELETE",
    })

    emit("userDeleted", username)
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    alert(apiError?.data?.message ?? apiError?.message ?? "Fehler beim Deaktivieren des Benutzers")
  }
}

async function reactivateUser(username: string): Promise<void> {
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

async function changeRole(username: string, newRole: "admin" | "user"): Promise<void> {
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

function openPasswordResetModal(username: string): void {
  passwordResetModal.value = {
    isOpen: true,
    username,
  }
}

function closePasswordResetModal(): void {
  passwordResetModal.value = {
    isOpen: false,
    username: "",
  }
}

function handlePasswordResetSuccess(): void {
  emit("passwordReset", passwordResetModal.value.username)
}
</script>

<template>
  <div class="bg-white shadow rounded-lg">
    
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-800">Benutzer-Verwaltung</h2>
      <button
        class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        :disabled="loading"
        @click="emit('refresh')"
      >
        {{ loading ? "Lädt..." : "Aktualisieren" }}
      </button>
    </div>

    
    <div v-if="loading" class="p-6 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      <p class="text-gray-600 mt-2">Benutzer werden geladen...</p>
    </div>

    
    <AlertMessage v-else-if="error" type="error" :message="error" class="m-6" />

    
    <div v-else-if="users.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benutzername</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.username">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ user.username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                class="text-orange-600 hover:text-orange-900 transition-colors"
                title="Passwort zurücksetzen"
                @click="openPasswordResetModal(user.username)"
              >
                Passwort
              </button>
              
              
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

    
    <div v-else class="text-center py-8">
      <p class="text-gray-500">Keine Benutzer gefunden</p>
    </div>

    
    <PasswordResetModal
      :username="passwordResetModal.username"
      :is-open="passwordResetModal.isOpen"
      @close="closePasswordResetModal"
      @success="handlePasswordResetSuccess"
    />
  </div>
</template>
