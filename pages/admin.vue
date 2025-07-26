<script setup lang="ts">
import type { User } from '~/types/index'

// Meta
useHead({
  title: 'Administration - URL Shortener'
})

// Middleware
definePageMeta({
  middleware: 'admin'
})

// Auth Check
const { user, initAuth } = useAuth()

onMounted(async (): Promise<void> => {
  await initAuth()
  if (!user.value || user.value.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin-Berechtigung erforderlich'
    })
  }
  
  // Lade Benutzer nach erfolgreicher Auth
  await loadUsers()
})

// Reactive Data
const users = ref<User[]>([])
const usersLoading = ref<boolean>(true)
const usersError = ref<string>('')

// New User Form
const newUsername = ref<string>('')
const newPassword = ref<string>('')
const newRole = ref<'admin' | 'user'>('user')
const createLoading = ref<boolean>(false)
const createError = ref<string>('')
const createSuccess = ref<string>('')

// Load Users
const loadUsers = async (): Promise<void> => {
  try {
    usersLoading.value = true
    usersError.value = ''
    
    const response = await $fetch<User[]>('/api/admin/users')
    users.value = response
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    usersError.value = apiError?.data?.message ?? apiError?.message ?? 'Fehler beim Laden der Benutzer'
  } finally {
    usersLoading.value = false
  }
}

// Create User
const createUser = async (): Promise<void> => {
  if (!newUsername.value.trim() || !newPassword.value.trim()) {
    createError.value = 'Bitte füllen Sie alle Felder aus'
    return
  }

  if (newPassword.value.length < 6) {
    createError.value = 'Passwort muss mindestens 6 Zeichen lang sein'
    return
  }

  createLoading.value = true
  createError.value = ''
  createSuccess.value = ''

  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        username: newUsername.value.trim(),
        password: newPassword.value,
        role: newRole.value
      }
    })

    createSuccess.value = `Benutzer "${newUsername.value}" erfolgreich erstellt`
    
    // Reset form
    newUsername.value = ''
    newPassword.value = ''
    newRole.value = 'user'
    
    // Reload users
    await loadUsers()
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    createError.value = apiError?.data?.message ?? apiError?.message ?? 'Fehler beim Erstellen des Benutzers'
  } finally {
    createLoading.value = false
  }
}

// Update User Role
const updateUserRole = async (username: string, newRole: 'admin' | 'user'): Promise<void> => {
  try {
    await $fetch(`/api/admin/users/${username}/role`, {
      method: 'PUT',
      body: { role: newRole }
    })
    
    // Update local state
    const userIndex = users.value.findIndex(u => u.username === username)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    alert(`Fehler beim Ändern der Rolle: ${apiError?.data?.message ?? apiError?.message ?? 'Unbekannter Fehler'}`)
  }
}

// Delete User
const deleteUser = async (username: string): Promise<void> => {
  if (!confirm(`Sind Sie sicher, dass Sie den Benutzer "${username}" löschen möchten?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/users/${username}`, {
      method: 'DELETE'
    })
    
    // Remove from local state
    users.value = users.value.filter(u => u.username !== username)
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    alert(`Fehler beim Löschen: ${apiError?.data?.message ?? apiError?.message ?? 'Unbekannter Fehler'}`)
  }
}

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Admin-Verwaltung</h1>
      <p class="text-gray-600 mt-2">Benutzer- und Systemverwaltung</p>
    </div>

    <div class="space-y-6">
      <!-- Create User Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Neuen Benutzer erstellen</h2>
        
        <form @submit.prevent="createUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Benutzername *
              </label>
              <input
                id="username"
                v-model="newUsername"
                type="text"
                required
                placeholder="benutzername"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Passwort *
              </label>
              <input
                id="password"
                v-model="newPassword"
                type="password"
                required
                placeholder="Mindestens 6 Zeichen"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
            </div>
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
              Rolle *
            </label>
            <select
              id="role"
              v-model="newRole"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="user">Benutzer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            :disabled="createLoading"
            class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {{ createLoading ? 'Wird erstellt...' : 'Benutzer erstellen' }}
          </button>
        </form>

        <!-- Create Success -->
        <div v-if="createSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {{ createSuccess }}
        </div>

        <!-- Create Error -->
        <div v-if="createError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {{ createError }}
        </div>
      </div>

      <!-- Users List -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Benutzer-Verwaltung</h2>
        
        <!-- Loading State -->
        <div v-if="usersLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p class="text-gray-600 mt-2">Benutzer werden geladen...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="usersError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ usersError }}
        </div>

        <!-- Users Table -->
        <div v-else-if="users.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benutzer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erstellt
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="userItem in users" :key="userItem.username" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ userItem.username }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="userItem.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ userItem.role === 'admin' ? 'Administrator' : 'Benutzer' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(userItem.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <!-- Role Change -->
                  <button
                    v-if="userItem.username !== user?.username"
                    @click="updateUserRole(userItem.username, userItem.role === 'admin' ? 'user' : 'admin')"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    {{ userItem.role === 'admin' ? '👤 Zu Benutzer' : '👑 Zu Admin' }}
                  </button>
                  
                  <!-- Delete -->
                  <button
                    v-if="userItem.username !== user?.username"
                    @click="deleteUser(userItem.username)"
                    class="text-red-600 hover:text-red-900"
                  >
                    🗑️ Löschen
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Users -->
        <div v-else class="text-center py-8 text-gray-500">
          Keine Benutzer gefunden.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zusätzliche Styles falls nötig */
</style>
