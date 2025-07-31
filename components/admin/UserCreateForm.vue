<script setup lang="ts">
import type { User } from "~/types/index"

// Props & Emits
interface Props {
  loading?: boolean
}

interface Emits {
  (e: "userCreated", user: User): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// Form Data
const newUsername = ref<string>("")
const newPassword = ref<string>("")
const newRole = ref<"admin" | "user">("user")
const createUserError = ref<string>("")
const createSuccess = ref<string>("")
const createLoading = ref<boolean>(false)

// Form Validation
const validateForm = (): boolean => {
  if (!newUsername.value.trim() || !newPassword.value.trim()) {
    createUserError.value = "Bitte füllen Sie alle Felder aus"
    return false
  }

  if (newPassword.value.length < 6) {
    createUserError.value = "Passwort muss mindestens 6 Zeichen lang sein"
    return false
  }

  return true
}

// Reset Form
const resetForm = (): void => {
  newUsername.value = ""
  newPassword.value = ""
  newRole.value = "user"
  createUserError.value = ""
  createSuccess.value = ""
}

// Create User
const createUser = async (): Promise<void> => {
  if (!validateForm()) return

  createLoading.value = true
  createUserError.value = ""
  createSuccess.value = ""

  try {
    const response = await $fetch<{ success: boolean; user: User; message?: string }>("/api/admin/users", {
      method: "POST",
      body: {
        username: newUsername.value.trim(),
        password: newPassword.value,
        role: newRole.value,
      },
    })

    if (response.success && response.user) {
      createSuccess.value = `Benutzer "${response.user.username}" erfolgreich erstellt`
      emit("userCreated", response.user)
      resetForm()
    }
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    createUserError.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Erstellen des Benutzers"
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Neuen Benutzer erstellen</h2>

    <form @submit.prevent="createUser" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2"> Benutzername * </label>
          <input
            id="username"
            v-model="newUsername"
            type="text"
            required
            placeholder="benutzername"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2"> Passwort * </label>
          <input
            id="password"
            v-model="newPassword"
            type="password"
            required
            placeholder="Mindestens 6 Zeichen"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-2">Rolle</label>
        <select
          id="role"
          v-model="newRole"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="user">Benutzer</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Zurücksetzen
        </button>
        <button
          type="submit"
          :disabled="createLoading"
          class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {{ createLoading ? "Erstelle..." : "Benutzer erstellen" }}
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="createSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        ✅ {{ createSuccess }}
      </div>

      <!-- Error Message -->
      <div v-if="createUserError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        ❌ {{ createUserError }}
      </div>
    </form>
  </div>
</template>
