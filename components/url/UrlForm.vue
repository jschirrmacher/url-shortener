<script setup lang="ts">
interface Props {
  shortUrl?: string
  shortCode?: string
  originalUrl?: string
  title?: string
  owner?: string
}

interface Emits {
  (e: "changed", data: { shortCode: string; originalUrl: string; title: string; owner?: string }): void
  (e: "cancel"): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  shortCode: '',
  shortUrl: '',
  originalUrl: '',
  owner: ''
})

const emit = defineEmits<Emits>()

const { copyToClipboard } = useClipboard()
const { user: currentUser } = useAuth()
const usersStore = useUsersStore()

const isEditMode = computed(() => !!props.shortUrl)
const isAdmin = computed(() => currentUser.value?.role === 'admin')

const formData = reactive({
  originalUrl: "",
  shortCode: "",
  title: "",
  owner: ""
})

// Initialize form data when component mounts or props change
watchEffect(() => {
  formData.originalUrl = props.originalUrl || ""
  formData.shortCode = props.shortCode || ""
  formData.title = props.title || ""
  formData.owner = props.owner || currentUser.value?.username || ""
})

// Load users for admin
onMounted(() => {
  if (isAdmin.value) {
    usersStore.loadUsers()
  }
})

// Validation state
const validationErrors = reactive({
  originalUrl: "",
  shortCode: ""
})

// Validation
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isValidShortCode(code: string): boolean {
  if (!code) return true
  if (code.length < 6) return false
  return /^[a-zA-Z0-9_\-]+$/v.test(code)
}

function validateForm(): boolean {
  // Trigger validation for empty fields
  if (!formData.originalUrl.trim()) {
    validationErrors.originalUrl = "URL ist erforderlich"
  }

  // Return true if no validation errors exist
  return !validationErrors.originalUrl && !validationErrors.shortCode
}

// Real-time validation
watch(() => formData.originalUrl, (value) => {
  if (value.trim() && !isValidUrl(value)) {
    validationErrors.originalUrl = "Ungültige URL"
  } else {
    validationErrors.originalUrl = ""
  }
})

watch(() => formData.shortCode, (value) => {
  if (value) {
    if (value.length < 6) {
      validationErrors.shortCode = "Mindestens 6 Zeichen erforderlich"
    } else if (!/^[a-zA-Z0-9_\-]+$/v.test(value)) {
      validationErrors.shortCode = "Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt"
    } else {
      validationErrors.shortCode = ""
    }
  } else {
    validationErrors.shortCode = ""
  }
})

const isFormValid = computed(() => {
  const hasUrl = formData.originalUrl.trim() !== ''
  const validUrl = hasUrl && isValidUrl(formData.originalUrl)
  const validShortCode = isValidShortCode(formData.shortCode)
  return hasUrl && validUrl && validShortCode
})

// Handle form submission
function handleSubmit() {
  if (!validateForm()) return

  emit('changed', {
    shortCode: formData.shortCode,
    originalUrl: formData.originalUrl,
    title: formData.title,
    owner: formData.owner
  })
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="url-form">
    <!-- Edit mode: Show current short URL -->
    <div v-if="isEditMode && shortUrl" class="readonly-field">
      <label>Kurz-URL</label>
      <div class="input-with-button">
        <input :value="shortUrl" readonly class="readonly-input">
        <BaseButton variant="secondary" size="sm" @click="copyToClipboard(shortUrl)">
          Kopieren
        </BaseButton>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- URL field (first and most important) -->
      <div class="form-field">
        <label for="originalUrl">{{ isEditMode ? 'Ziel-URL' : 'URL zum Verkürzen' }}</label>
        <input
          id="originalUrl"
          v-model="formData.originalUrl"
          type="url"
          required
          placeholder="https://example.com"
          :class="{ 'error': validationErrors.originalUrl }"
        >
        <p v-if="validationErrors.originalUrl" class="error-message">
          {{ validationErrors.originalUrl }}
        </p>
      </div>

      <!-- Optional fields in responsive layout -->
      <div class="optional-fields">
        <!-- Short code field (smaller) -->
        <div class="form-field shortcode-field">
          <label for="shortCode">{{ isEditMode ? 'Kurz-Code' : 'Kurz-Code (optional)' }}</label>
          <input
            id="shortCode"
            v-model="formData.shortCode"
            type="text"
            :placeholder="isEditMode ? 'z.B. mein-link' : 'Auto-generiert'"
            :required="isEditMode"
            pattern="[a-zA-Z0-9_\-]{6,}"
            title="Mindestens 6 Zeichen: Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt"
            :class="{ 'error': validationErrors.shortCode }"
          >
          <p v-if="validationErrors.shortCode" class="error-message">
            {{ validationErrors.shortCode }}
          </p>
        </div>

        <div v-if="isAdmin && usersStore.users.length > 0" class="form-field owner-field" data-testid="owner-field">
          <label for="owner">Eigentümer</label>
          <select id="owner" v-model="formData.owner" class="owner-select">
            <option 
              v-for="user in usersStore.users" 
              :key="user.username"
              :value="user.username"
            >
              {{ user.username }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-field title-field">
        <label for="title">Titel (optional)</label>
        <input id="title" v-model="formData.title" type="text" placeholder="Beschreibender Titel für den Link">
      </div>

      <!-- Buttons -->
      <div class="form-actions">
        <BaseButton variant="primary" type="submit" :disabled="!isFormValid">
          {{ isEditMode ? 'Speichern' : 'URL verkürzen' }}
        </BaseButton>

        <BaseButton v-if="isEditMode" variant="secondary" type="button" @click="handleCancel">
          Abbrechen
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.url-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.readonly-field {
  margin-bottom: 1rem;
}

.readonly-field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.readonly-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  padding-left: 0.25rem;
}

.form-field input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-field input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field input.error {
  border-color: #ef4444;
}

.form-field input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  font-size: 0.75rem;
  color: #ef4444;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .error-message {
    color: #f87171;
  }
}

.field-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  padding-left: 0.25rem;
}

.field-hint.error-hint {
  color: #dc2626;
}

.optional-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .optional-fields {
    flex-direction: row;
    gap: 1rem;
  }

  .shortcode-field {
    flex: 0 0 200px;
    /* Fixed width for short code */
  }

  .owner-field {
    flex: 0 0 200px;
    /* Fixed width for owner selection */
  }
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.owner-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.owner-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
</style>
