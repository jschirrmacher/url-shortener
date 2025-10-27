<script setup lang="ts">
const { theme, applyTheme } = useTheme()
</script>

<template>
  <div class="theme-selector">
    <div class="text-xs font-medium text-gray-500 mb-2">Theme</div>
    <div class="flex gap-1">
      <button
        :class="['theme-btn', 'btn-secondary', theme === 'light' ? 'active' : '']"
        title="Light Mode"
        @click="applyTheme('light')"
      >
        ☀️
      </button>
      <button
        :class="['theme-btn', 'btn-secondary', theme === 'dark' ? 'active' : '']"
        title="Dark Mode"
        @click="applyTheme('dark')"
      >
        🌙
      </button>
      <button
        :class="['theme-btn', 'btn-secondary', theme === 'system' ? 'active' : '']"
        title="System"
        @click="applyTheme('system')"
      >
        💻
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-selector {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.theme-btn {
  width: 2rem;
  height: 2rem;
  border-width: 1px;
}

.theme-btn.active {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: white !important;
}
</style>
