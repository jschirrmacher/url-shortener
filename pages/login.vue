<script setup lang="ts">
const { login: authLogin, user } = usePublicPage("Login - URL Shortener")

// Redirect wenn bereits angemeldet
onMounted(async (): Promise<void> => {
  if (user.value) {
    await navigateTo("/")
  }
})

const username = ref<string>("")
const password = ref<string>("")
const loading = ref<boolean>(false)
const error = ref<string>("")

const login = async function(): Promise<void> {
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
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>URL-Shortener</h1>
          <p>Bitte melden Sie sich an</p>
        </div>
        <form @submit.prevent="login">
          <FormField
            id="username"
            v-model="username"
            label="Benutzername"
            type="text"
            placeholder="Ihr Benutzername"
            required
          />
          <FormField
            id="password"
            v-model="password"
            label="Passwort"
            type="password"
            placeholder="Ihr Passwort"
            required
          />
          <BaseButton type="submit" variant="primary" :loading="loading" full-width>
            {{ loading ? "Wird angemeldet..." : "Anmelden" }}
          </BaseButton>
        </form>
        <!-- Error Message -->
        <div v-if="error" class="error-message">{{ error }}</div>
        <!-- Info -->
        <div class="info-text">
          <p>Noch kein Account? Wenden Sie sich an einen Administrator.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.login-card {
  background-color: var(--bg-primary);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}
</style>
