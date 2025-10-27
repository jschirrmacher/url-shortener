<script setup lang="ts">
interface Props {
  username: string
}

defineProps<Props>()
</script>

<template>
  <div class="avatar-circle">
    {{ username.charAt(0).toUpperCase() }}
  </div>
</template>

<style scoped>
.avatar-circle {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 50%;
  border: 2px solid var(--border-primary);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}
</style>
