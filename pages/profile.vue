<script setup lang="ts">
// Meta
useHead({
  title: 'Profil - URL Shortener',
})

// Middleware
definePageMeta({
  middleware: 'auth',
})

// Auth
const { user, initAuth } = useAuth()

onMounted(async (): Promise<void> => {
  await initAuth()
  if (!user.value) {
    await navigateTo('/login')
  }
})

// Reactive Data
const currentPassword = ref<string>('')
const newPassword = ref<string>('')
const confirmPassword = ref<string>('')
const loading = ref<boolean>(false)
const error = ref<string>('')
const success = ref<string>('')

// Change Password
const changePassword = async (): Promise<void> => {
  // Validation
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Bitte füllen Sie alle Felder aus'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Neues Passwort muss mindestens 6 Zeichen lang sein'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Neue Passwörter stimmen nicht überein'
    return
  }

  if (currentPassword.value === newPassword.value) {
    error.value = 'Neues Passwort muss sich vom aktuellen unterscheiden'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    })

    success.value = 'Passwort erfolgreich geändert!'

    // Reset form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value = apiError?.data?.message ?? apiError?.message ?? 'Fehler beim Ändern des Passworts'
  } finally {
    loading.value = false
  }
}

// Helper Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Mein Profil</h1>
      <p class="text-gray-600 mt-2">Passwort ändern und Konto-Einstellungen</p>
    </div>

    <div v-if="user" class="space-y-6">
      <!-- User Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Benutzer-Informationen</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
            <p class="text-gray-900 font-medium">{{ user.username }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
            <span
              :class="
                user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              "
              class="px-2 py-1 text-xs font-semibold rounded-full"
            >
              {{ user.role === 'admin' ? 'Administrator' : 'Benutzer' }}
            </span>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Konto erstellt</label>
          <p class="text-gray-900">{{ formatDate(user.createdAt) }}</p>
        </div>
      </div>

      <!-- Change Password Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Passwort ändern</h2>

        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Aktuelles Passwort *
            </label>
            <input
              id="currentPassword"
              v-model="currentPassword"
              type="password"
              required
              placeholder="Ihr aktuelles Passwort"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Neues Passwort *
              </label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                required
                placeholder="Mindestens 6 Zeichen"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Passwort bestätigen *
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                placeholder="Neues Passwort wiederholen"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {{ loading ? 'Wird geändert...' : 'Passwort ändern' }}
          </button>
        </form>

        <!-- Success Message -->
        <div
          v-if="success"
          class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded"
        >
          ✅ {{ success }}
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {{ error }}
        </div>
      </div>

      <!-- Security Tips -->
      <div class="bg-blue-50 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-800 mb-3">🔒 Sicherheitstipps</h3>
        <ul class="text-blue-700 space-y-2 text-sm">
          <li>• Verwenden Sie ein starkes, einzigartiges Passwort</li>
          <li>• Kombinieren Sie Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen</li>
          <li>• Teilen Sie Ihr Passwort niemals mit anderen</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zusätzliche Styles falls nötig */
</style>
