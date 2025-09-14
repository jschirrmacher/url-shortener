<script setup lang="ts">
interface CreateUrlResponse {
  shortCode: string
  originalUrl: string
  shortUrl: string
}

interface ApiError {
  data?: { message?: string }
  message?: string
}

interface Emits {
  (e: "created", url: CreateUrlResponse): void
}

const emit = defineEmits<Emits>()

// Form state
const state = reactive({
  originalUrl: "",
  shortCode: "",
  loading: false,
  error: "",
  success: false,
  successMessage: ""
})

// Validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const isValidShortCode = (code: string): boolean => {
  if (!code) return true // Optional field
  return /^[a-zA-Z0-9-_]+$/.test(code)
}

const isFormValid = computed(() => {
  const hasUrl = state.originalUrl.trim() !== ''
  const validUrl = hasUrl && isValidUrl(state.originalUrl)
  const validShortCode = isValidShortCode(state.shortCode)
  
  return hasUrl && validUrl && validShortCode
})

// Form submission
const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    state.loading = true
    state.error = ""
    state.success = false

    const body: { originalUrl: string; shortCode?: string } = {
      originalUrl: state.originalUrl.trim()
    }

    if (state.shortCode.trim()) {
      body.shortCode = state.shortCode.trim()
    }

    const { data: response, error } = await useFetch<CreateUrlResponse>('/api/urls', {
      method: 'POST',
      body
    })

    if (error.value) {
      throw error.value
    }

    if (!response.value) {
      throw new Error("Keine Antwort vom Server")
    }

    // Success
    state.success = true
    state.successMessage = `URL erfolgreich verkürzt: ${response.value.shortUrl}`
    
    // Emit created event
    emit("created", response.value)

    // Reset form
    resetForm()

  } catch (error: unknown) {
    const apiError = error as ApiError
    state.error = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Erstellen der URL"
  } finally {
    state.loading = false
  }
}

const resetForm = () => {
  state.originalUrl = ""
  state.shortCode = ""
  state.error = ""
  // Keep success message visible for a moment
  setTimeout(() => {
    state.success = false
    state.successMessage = ""
  }, 3000)
}

// Expose functions for testing
defineExpose({
  handleSubmit,
  state,
  isFormValid
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">URL verkürzen</h2>
    
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- URL Input -->
      <div>
        <label for="originalUrl" class="block text-sm font-medium text-gray-700 mb-1">
          URL *
        </label>
        <input
          id="originalUrl"
          v-model="state.originalUrl"
          type="url"
          required
          placeholder="https://example.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': state.originalUrl && !isValidUrl(state.originalUrl) }"
        >
        <p v-if="state.originalUrl && !isValidUrl(state.originalUrl)" class="text-xs text-red-600 mt-1">
          Gültige URL erforderlich
        </p>
      </div>

      <!-- Short Code Input -->
      <div>
        <label for="shortCode" class="block text-sm font-medium text-gray-700 mb-1">
          Kurz-Code (optional)
        </label>
        <input
          id="shortCode"
          v-model="state.shortCode"
          type="text"
          placeholder="z.B. mein-link"
          pattern="[a-zA-Z0-9-_]+"
          title="Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': state.shortCode && !isValidShortCode(state.shortCode) }"
        >
        <p class="text-xs text-gray-500 mt-1">
          Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt
        </p>
        <p v-if="state.shortCode && !isValidShortCode(state.shortCode)" class="text-xs text-red-600 mt-1">
          Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="state.error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Fehler</h3>
            <p class="mt-1 text-sm text-red-700">{{ state.error }}</p>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="state.success" class="bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">URL erfolgreich verkürzt</h3>
            <p class="mt-1 text-sm text-green-700">{{ state.successMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-4">
        <button
          type="submit"
          :disabled="!isFormValid || state.loading"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ state.loading ? "Wird erstellt..." : "URL verkürzen" }}
        </button>
      </div>
    </form>
  </div>
</template>
