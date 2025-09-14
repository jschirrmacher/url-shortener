<script setup lang="ts">
interface Props {
  title: string
}

interface Emits {
  close: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <header class="modal-header">
    <h2>{{ title }}</h2>
    <button
      data-testid="close-button"
      type="button"
      class="close-button"
      @click="$emit('close')"
    >
      <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </header>
</template>

<style scoped>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  transition: color 150ms;
}

.close-button:hover {
  color: #4b5563;
}

.close-button:focus {
  outline: none;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
