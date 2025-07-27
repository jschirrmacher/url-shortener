<script setup lang="ts">
// Props & Emits
interface Emits {
  (e: 'urlCreated', data: { shortCode: string; shortUrl: string }): void
}

const emit = defineEmits<Emits>()

// Form Data
const originalUrl = ref<string>('')
const customCode = ref<string>('')
const title = ref<string>('')
const loading = ref<boolean>(false)
const error = ref<string>('')
const success = ref<string>('')

// Form Validation
const validateForm = (): boolean => {
  if (!originalUrl.value.trim()) {
    error.value = 'Bitte geben Sie eine URL ein'
    return false
  }

  // Basic URL validation
  try {
    new URL(originalUrl.value.trim())
  } catch {
    error.value = 'Bitte geben Sie eine gültige URL ein'
    return false
  }

  return true
}

// Reset Form
const resetForm = (): void => {
  originalUrl.value = ''
  customCode.value = ''
  title.value = ''
  error.value = ''
  success.value = ''
}

// Create Short URL
const createShortUrl = async (): Promise<void> => {
  if (!validateForm()) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch<{ shortCode: string; shortUrl: string }>('/api/urls', {
      method: 'POST',
      body: {
        originalUrl: originalUrl.value.trim(),
        customCode: customCode.value.trim() || undefined,
        title: title.value.trim() || undefined,
      },
    })

    success.value = `Kurz-URL erstellt: ${response.shortUrl}`
    emit('urlCreated', response)

    // Reset form after successful creation
    setTimeout(() => {
      resetForm()
    }, 2000)
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value = apiError?.data?.message ?? apiError?.message ?? 'Fehler beim Erstellen der URL'
  } finally {
    loading.value = false
  }
}

// Copy to clipboard
const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">URL verkürzen</h2>

    <form @submit.prevent="createShortUrl" class="space-y-4">
      <!-- Original URL -->
      <div>
        <label for="originalUrl" class="block text-sm font-medium text-gray-700 mb-2">
          Ursprüngliche URL *
        </label>
        <input
          id="originalUrl"
          v-model="originalUrl"
          type="url"
          required
          placeholder="https://example.com/very/long/url"
          class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <!-- Optional Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="customCode" class="block text-sm font-medium text-gray-700 mb-2">
            Benutzerdefinierter Code (optional)
          </label>
          <input
            id="customCode"
            v-model="customCode"
            type="text"
            placeholder="mein-code"
            pattern="[a-zA-Z0-9_-]+"
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">Nur Buchstaben, Zahlen, _ und - erlaubt</p>
        </div>

        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Titel (optional)
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            placeholder="Beschreibender Titel"
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Zurücksetzen
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <span>{{ loading ? 'Erstelle...' : 'URL verkürzen' }}</span>
          <svg
            v-if="loading"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
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
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Success Message -->
      <div
        v-if="success"
        class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center justify-between"
      >
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ success }}</span>
        </div>
        <button
          @click="copyToClipboard(success.split(': ')[1])"
          class="text-green-600 hover:text-green-800 transition-colors"
          title="In Zwischenablage kopieren"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center space-x-2"
      >
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ error }}</span>
      </div>
    </form>
  </div>
</template>
