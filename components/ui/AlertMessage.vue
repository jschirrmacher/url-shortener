<script setup lang="ts">
interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

defineProps<Props>()

const typeConfig = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-400',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-400',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
  },
  warning: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    icon: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
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
    </div>
  </div>
</template>

<style scoped>
.alert-message {
  border: 1px solid;
  border-radius: 0.375rem;
  padding: 1rem;
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
</style>
