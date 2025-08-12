<script setup lang="ts">
// Form Data
const currentPassword = ref<string>("")
const newPassword = ref<string>("")
const confirmPassword = ref<string>("")
const loading = ref<boolean>(false)
const error = ref<string>("")
const success = ref<string>("")

// Form Validation
const validateForm = (): boolean => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = "Bitte füllen Sie alle Felder aus"
    return false
  }

  if (newPassword.value.length < 6) {
    error.value = "Neues Passwort muss mindestens 6 Zeichen lang sein"
    return false
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Neue Passwörter stimmen nicht überein"
    return false
  }

  if (currentPassword.value === newPassword.value) {
    error.value = "Neues Passwort muss sich vom aktuellen unterscheiden"
    return false
  }

  return true
}

// Reset Form
const resetForm = (): void => {
  currentPassword.value = ""
  newPassword.value = ""
  confirmPassword.value = ""
  error.value = ""
  success.value = ""
}

// Change Password
const changePassword = async (): Promise<void> => {
  if (!validateForm()) return

  loading.value = true
  error.value = ""
  success.value = ""

  try {
    const response = await $fetch<{ success: boolean; message?: string }>("/api/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    })

    if (response.success) {
      success.value = "Passwort erfolgreich geändert"
      resetForm()
    }
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Ändern des Passworts"
  } finally {
    loading.value = false
  }
}

// Dismiss messages
const dismissSuccess = (): void => {
  success.value = ""
}

const dismissError = (): void => {
  error.value = ""
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">Passwort ändern</h2>
    <form class="space-y-6" @submit.prevent="changePassword">
      <!-- Current Password -->
      <FormField
        v-model="currentPassword"
        label="Aktuelles Passwort"
        type="password"
        placeholder="Ihr aktuelles Passwort"
        required
      />
      <!-- New Password -->
      <FormField
        v-model="newPassword"
        label="Neues Passwort"
        type="password"
        placeholder="Mindestens 6 Zeichen"
        hint="Das Passwort sollte mindestens 6 Zeichen lang sein"
        required
      />
      <!-- Confirm New Password -->
      <FormField
        v-model="confirmPassword"
        label="Neues Passwort bestätigen"
        type="password"
        placeholder="Neues Passwort wiederholen"
        required
      />
      <!-- Form Actions -->
      <div class="flex justify-end space-x-3">
        <BaseButton type="button" variant="secondary" @click="resetForm">Zurücksetzen</BaseButton>
        <BaseButton type="submit" variant="primary" :loading="loading" :disabled="loading">
          {{ loading ? "Ändere..." : "Passwort ändern" }}
        </BaseButton>
      </div>
      <!-- Success Message -->
      <AlertMessage v-if="success" type="success" :message="success" dismissible @dismiss="dismissSuccess" />
      <!-- Error Message -->
      <AlertMessage v-if="error" type="error" :message="error" dismissible @dismiss="dismissError" />
    </form>
  </div>
</template>
