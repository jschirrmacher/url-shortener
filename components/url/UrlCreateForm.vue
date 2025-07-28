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

// Dismiss messages
const dismissSuccess = (): void => {
  success.value = ''
}

const dismissError = (): void => {
  error.value = ''
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">URL verkürzen</h2>

    <form @submit.prevent="createShortUrl" class="space-y-6">
      <!-- Original URL Field -->
      <FormField
        v-model="originalUrl"
        label="Ursprüngliche URL"
        type="url"
        placeholder="https://example.com/very/long/url"
        required
      />

      <!-- Optional Fields Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          v-model="customCode"
          label="Benutzerdefinierter Code"
          placeholder="mein-code"
          pattern="[a-zA-Z0-9_-]+"
          hint="Nur Buchstaben, Zahlen, _ und - erlaubt"
        />

        <FormField v-model="title" label="Titel" placeholder="Beschreibender Titel" />
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3">
        <FormButton type="button" variant="secondary" @click="resetForm"> Zurücksetzen </FormButton>

        <FormButton type="submit" variant="primary" :loading="loading" :disabled="loading">
          {{ loading ? 'Erstelle...' : 'URL verkürzen' }}
        </FormButton>
      </div>

      <!-- Success Message -->
      <AlertMessage
        v-if="success"
        type="success"
        :message="success"
        dismissible
        @dismiss="dismissSuccess"
      />

      <!-- Error Message -->
      <AlertMessage
        v-if="error"
        type="error"
        :message="error"
        dismissible
        @dismiss="dismissError"
      />
    </form>
  </div>
</template>
