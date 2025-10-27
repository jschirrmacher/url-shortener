<script setup lang="ts">
interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  dismissible?: boolean
}

interface Emits {
  dismiss: []
}

withDefaults(defineProps<Props>(), {
  dismissible: false
})

defineEmits<Emits>()

const typeConfig = {
  success: {
    bgColor: 'alert-success-bg',
    borderColor: 'alert-success-border',
    iconColor: 'alert-success-icon',
    titleColor: 'alert-success-title',
    messageColor: 'alert-success-message',
    icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
  },
  error: {
    bgColor: 'alert-error-bg',
    borderColor: 'alert-error-border',
    iconColor: 'alert-error-icon',
    titleColor: 'alert-error-title',
    messageColor: 'alert-error-message',
    icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
  },
  warning: {
    bgColor: 'alert-warning-bg',
    borderColor: 'alert-warning-border',
    iconColor: 'alert-warning-icon',
    titleColor: 'alert-warning-title',
    messageColor: 'alert-warning-message',
    icon: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
  },
  info: {
    bgColor: 'alert-info-bg',
    borderColor: 'alert-info-border',
    iconColor: 'alert-info-icon',
    titleColor: 'alert-info-title',
    messageColor: 'alert-info-message',
    icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
  }
}
</script>

<template>
  <div class="alert-message" :class="[typeConfig[type].bgColor, typeConfig[type].borderColor]">
    <div class="alert-content">
      <svg class="alert-icon" :class="typeConfig[type].iconColor" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          :d="typeConfig[type].icon"
          clip-rule="evenodd"
        />
      </svg>
      <div class="alert-text">
        <h3 :class="typeConfig[type].titleColor">{{ title }}</h3>
        <p v-if="message" :class="typeConfig[type].messageColor">{{ message }}</p>
      </div>
      <button
        v-if="dismissible"
        class="dismiss-button"
        :class="typeConfig[type].iconColor"
        @click="$emit('dismiss')"
      >
        <svg class="dismiss-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.alert-message {
  border: 1px solid;
  border-radius: 0.375rem;
  padding: 1rem;
}

/* Success Alert */
.alert-success-bg {
  background-color: #f0fdf4;
}
.alert-success-border {
  border-color: #bbf7d0;
}
.alert-success-icon {
  color: #4ade80;
}
.alert-success-title {
  color: #166534;
}
.alert-success-message {
  color: #15803d;
}

/* Error Alert */
.alert-error-bg {
  background-color: #fef2f2;
}
.alert-error-border {
  border-color: #fecaca;
}
.alert-error-icon {
  color: #f87171;
}
.alert-error-title {
  color: #991b1b;
}
.alert-error-message {
  color: #b91c1c;
}

/* Warning Alert */
.alert-warning-bg {
  background-color: #fffbeb;
}
.alert-warning-border {
  border-color: #fed7aa;
}
.alert-warning-icon {
  color: #fbbf24;
}
.alert-warning-title {
  color: #92400e;
}
.alert-warning-message {
  color: #b45309;
}

/* Info Alert */
.alert-info-bg {
  background-color: #eff6ff;
}
.alert-info-border {
  border-color: #bfdbfe;
}
.alert-info-icon {
  color: #60a5fa;
}
.alert-info-title {
  color: #1e40af;
}
.alert-info-message {
  color: #1d4ed8;
}

.alert-content {
  display: flex;
  gap: 0.75rem;
}

.alert-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.alert-text h3 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.alert-text p {
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.dismiss-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  flex-shrink: 0;
}

.dismiss-button:hover {
  opacity: 0.7;
}

.dismiss-icon {
  width: 1rem;
  height: 1rem;
}
</style>
