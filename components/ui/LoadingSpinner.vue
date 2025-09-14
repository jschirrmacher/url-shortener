<script setup lang="ts">
interface Props {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Lädt...',
  size: 'md'
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
}
</script>

<template>
  <div class="loading-spinner">
    <div class="spinner" :class="sizeClasses[size]" />
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.spinner {
  border: 2px solid #e5e7eb;
  border-bottom-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  margin-top: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;
}
</style>
