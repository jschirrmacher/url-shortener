<script setup lang="ts">
import { computed } from "vue"

interface Props {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  type?: "button" | "submit" | "reset"
  fullWidth?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: "secondary",
  size: "md",
  disabled: false,
  loading: false,
  type: "button",
  fullWidth: false,
})

const emit = defineEmits<Emits>()

const baseClasses =
  "inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

const variantClasses = computed(() => `btn-${props.variant ?? 'secondary'}`)
const sizeClasses = computed(() => `btn-${props.size ?? 'md'}`)

const widthClasses = computed(() => {
  return props.fullWidth ? "w-full" : ""
})

const buttonClasses = computed(() => {
  return [baseClasses, variantClasses.value, sizeClasses.value, widthClasses.value].join(" ")
})

const isDisabled = computed(() => props.disabled || props.loading)

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit("click", event)
  }
}
</script>

<template>
  <button :type="type" :disabled="isDisabled" :class="buttonClasses" @click="handleClick">
    <!-- Loading Spinner -->
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <!-- Button Content -->
    <slot />
  </button>
</template>

<style scoped>
/* Base Button Styles */
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  outline: none;
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  border-width: 1px;
  cursor: pointer;
}

button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--ring-color, #3b82f6);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variant Styles */
.btn-primary {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #ffffff !important;
  --ring-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}

.btn-secondary {
  background-color: var(--button-secondary-bg);
  border-color: var(--button-secondary-border);
  color: var(--button-secondary-text);
  --ring-color: #3b82f6;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--button-secondary-hover-bg);
  border-color: var(--button-secondary-hover-border);
}

.btn-danger {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: #ffffff !important;
  --ring-color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c !important;
  border-color: #b91c1c !important;
}

.btn-ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--text-primary);
  --ring-color: #3b82f6;
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}

/* Size Styles */
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.btn-md {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
}

/* Loading Spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.opacity-25 { opacity: 0.25; }
.opacity-75 { opacity: 0.75; }
</style>
