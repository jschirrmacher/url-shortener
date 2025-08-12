<script setup lang="ts">
const { login: authLogin, user } = usePublicPage("Login - URL Shortener")

// Redirect wenn bereits angemeldet
onMounted(async (): Promise<void> => {
  if (user.value) {
    await navigateTo("/")
  }
})

// Reactive Data
const username = ref<string>("")
const password = ref<string>("")
const loading = ref<boolean>(false)
const error = ref<string>("")

// Login Handler
const login = async (): Promise<void> => {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = "Bitte füllen Sie alle Felder aus"
    return
  }

  loading.value = true
  error.value = ""

  try {
    const result = await authLogin(username.value.trim(), password.value)

    if (result.success) {
      await navigateTo("/")
    } else {
      error.value = (result as { message?: string }).message ?? "Login fehlgeschlagen"
    }
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value = apiError?.data?.message ?? apiError?.message ?? "Login fehlgeschlagen"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">URL-Shortener</h1>
          <p class="text-gray-600 mt-2">Bitte melden Sie sich an</p>
        </div>
        <form class="space-y-6" @submit.prevent="login">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Benutzername</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              autocomplete="username"
              placeholder="Ihr Benutzername"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Passwort</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="Ihr Passwort"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
          </div>
          <BaseButton type="submit" variant="primary" :loading="loading" full-width>
            {{ loading ? "Wird angemeldet..." : "Anmelden" }}
          </BaseButton>
        </form>
        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ error }}</div>
        <!-- Info -->
        <div class="mt-6 text-center text-sm text-gray-600">
          <p>Noch kein Account? Wenden Sie sich an einen Administrator.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Zusätzliche Styles falls nötig */
</style>
