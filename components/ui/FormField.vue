<script setup lang="ts">
interface Props {
  label: string
  modelValue: string
  type?: "text" | "url" | "password" | "email"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  pattern?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  placeholder: "",
  required: false,
  disabled: false,
  error: "",
  hint: "",
  pattern: undefined,
  id: "",
})

// Emits
interface Emits {
  (e: "update:modelValue", value: string): void
}

const emit = defineEmits<Emits>()

// SSR-safe ID generation
const inputId =
  props.id ||
  `field-${props.label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")}`

const inputClasses = computed(() => [
  "form-input",
  props.error ? "form-input-error" : "form-input-normal",
  props.disabled ? "form-input-disabled" : "",
])

// Methods
function updateValue(event: Event) {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <label :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input Field -->
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      v-bind="pattern ? { pattern } : {}"
      :class="inputClasses"
      @input="updateValue"
    >

    <!-- Hint -->
    <p v-if="hint && !error" class="text-xs text-gray-500">
      {{ hint }}
    </p>

    <!-- Error Message -->
    <p v-if="error" class="text-xs text-red-600 flex items-center space-x-1">
      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
    </p>
  </div>
</template>

<style scoped>
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: 0.375rem;
  background-color: var(--input-bg);
  color: var(--input-text);
  transition: all 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--input-focus-border);
  border-color: var(--input-focus-border);
}

.form-input-normal:hover {
  border-color: var(--border-primary);
}

.form-input-error {
  border-color: #f87171;
  background-color: #fef2f2;
}

.form-input-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--text-secondary);
}
</style>
