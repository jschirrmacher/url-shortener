<script setup lang="ts">
interface Props {
  loading: boolean
}

interface Emits {
  refresh: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <header class="url-list-header">
    <h2>Meine URLs</h2>
    <BaseButton variant="primary" :disabled="loading" :loading="loading" @click="$emit('refresh')">
      {{ loading ? "Lädt..." : "Aktualisieren" }}
    </BaseButton>
  </header>
</template>

<style scoped>
.url-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.url-list-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
</style>
