<script setup lang="ts">
// Props
interface Props {
  label: string
  modelValue: string
  type?: 'text' | 'url' | 'password' | 'email'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  pattern?: string
  id?: string
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

// SSR-safe ID generation
const inputId =
  props.id ||
  `field-${props.label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')}`

const inputClasses = computed(() => [
  'w-full px-4 py-3 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
  props.error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
])

// Methods
const updateValue = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
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
      :pattern="pattern"
      :class="inputClasses"
      @input="updateValue"
    />

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
