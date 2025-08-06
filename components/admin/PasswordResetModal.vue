<script setup lang="ts">
interface Props {
  username: string
  isOpen: boolean
}

interface Emits {
  (e: "close" | "success"): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newPassword = ref("")
const confirmPassword = ref("")
const isLoading = ref(false)
const error = ref("")
const success = ref("")

const isFormValid = computed(() => {
  return (
    newPassword.value.length >= 8 &&
    confirmPassword.value === newPassword.value
  )
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

function resetForm(): void {
  newPassword.value = ""
  confirmPassword.value = ""
  error.value = ""
  success.value = ""
  isLoading.value = false
}

async function resetPassword(): Promise<void> {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ""
  success.value = ""

  try {
    const response = await $fetch<{ success: boolean; message: string }>(
      `/api/admin/users/${props.username}/password`,
      {
        method: "PUT",
        body: {
          newPassword: newPassword.value,
        },
      }
    )

    success.value = response.message
    
    setTimeout(() => {
      emit("success")
      emit("close")
    }, 2000)
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value = apiError.data?.message || apiError.message || "Passwort-Reset fehlgeschlagen"
  } finally {
    isLoading.value = false
  }
}

function closeModal(): void {
  emit("close")
}
</script>

<template>
  
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          Passwort zurücksetzen
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          Neues Passwort für Benutzer: <strong>{{ username }}</strong>
        </p>
      </div>

      
      <div class="px-6 py-4">
        
        <AlertMessage
          v-if="success"
          type="success"
          :message="success"
          class="mb-4"
        />

        
        <AlertMessage
          v-if="error"
          type="error"
          :message="error"
          class="mb-4"
        />

        
        <form class="space-y-4" @submit.prevent="resetPassword">
          
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Neues Passwort
            </label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mindestens 8 Zeichen"
              :disabled="isLoading"
            >
          </div>

          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Passwort wiederholen"
              :disabled="isLoading"
            >
            <p
              v-if="confirmPassword && confirmPassword !== newPassword"
              class="text-sm text-red-600 mt-1"
            >
              Passwörter stimmen nicht überein
            </p>
          </div>

          
          <div class="text-xs text-gray-500">
            <p>Passwort-Anforderungen:</p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li :class="newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'">
                Mindestens 8 Zeichen
              </li>
              <li :class="confirmPassword && confirmPassword === newPassword ? 'text-green-600' : 'text-gray-500'">
                Passwörter müssen übereinstimmen
              </li>
            </ul>
          </div>
        </form>
      </div>

      
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          :disabled="isLoading"
          @click="closeModal"
        >
          Abbrechen
        </button>
        <button
          type="button"
          :disabled="!isFormValid || isLoading"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          @click="resetPassword"
        >
          <svg
            v-if="isLoading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isLoading ? "Wird geändert..." : "Passwort ändern" }}
        </button>
      </div>
    </div>
  </div>
</template>
