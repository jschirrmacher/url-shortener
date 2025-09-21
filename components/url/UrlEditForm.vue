<script setup lang="ts">
interface Props {
  shortUrl: string
  shortCode: string
  originalUrl: string
  title?: string
  loading: boolean
}

interface Emits {
  submit: [data: { shortCode: string; originalUrl: string; title: string }]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { copyToClipboard } = useClipboard()

// Initialize with prop values - will be reactive to user input
const newShortCode = ref(props.shortCode)
const newUrl = ref(props.originalUrl)
const newTitle = ref(props.title || "")

function handleSubmit() {
  emit('submit', {
    shortCode: newShortCode.value,
    originalUrl: newUrl.value,
    title: newTitle.value
  })
}
</script>

<template>
  <div class="url-edit-form">
    <div class="readonly-field">
      <label>Kurz-URL</label>
      <div class="input-with-button">
        <input :value="shortUrl" readonly class="readonly-input">
        <BaseButton variant="secondary" size="sm" @click="copyToClipboard(shortUrl)">
          Kopieren
        </BaseButton>
      </div>
    </div>

    <form class="edit-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="newTitle">Titel (optional)</label>
        <input
          id="newTitle"
          v-model="newTitle"
          type="text"
          placeholder="Beschreibender Titel für den Link"
        >
      </div>

      <div class="form-field">
        <label for="newShortCode">Kurz-Code</label>
        <input
          id="newShortCode"
          v-model="newShortCode"
          type="text"
          required
          placeholder="z.B. mein-link"
          pattern="[a-zA-Z0-9-_]+"
          title="Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt"
        >
        <p class="field-hint">
          Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt
        </p>
      </div>

      <div class="form-field">
        <label for="newUrl">Ziel-URL</label>
        <input
          id="newUrl"
          v-model="newUrl"
          type="url"
          required
          placeholder="https://example.com"
        >
      </div>

      <div class="form-actions">
        <BaseButton variant="secondary" type="button" @click="$emit('cancel')">
          Abbrechen
        </BaseButton>
        <BaseButton
          data-testid="save-button"
          variant="primary"
          type="submit"
          :disabled="loading || !newUrl.trim() || !newShortCode.trim()"
          :loading="loading"
        >
          {{ loading ? "Speichert..." : "Speichern" }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.url-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.readonly-field label,
.form-field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.readonly-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  font-size: 0.875rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 150ms, box-shadow 150ms;
}

.form-field input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.field-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
