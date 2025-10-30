<script setup lang="ts">
const { theme, applyTheme } = useTheme()
</script>

<template>
  <div class="theme-selector">
    <div class="theme-label">Theme</div>
    <div class="theme-buttons">
      <button
        :class="['theme-btn', theme === 'light' ? 'active' : '']"
        title="Light Mode"
        @click="applyTheme('light')"
      >
        ☀️
      </button>
      <button
        :class="['theme-btn', theme === 'dark' ? 'active' : '']"
        title="Dark Mode"
        @click="applyTheme('dark')"
      >
        🌙
      </button>
      <button
        :class="['theme-btn', theme === 'system' ? 'active' : '']"
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

.theme-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.theme-buttons {
  display: flex;
  gap: 0.25rem;
}

.theme-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn:hover {
  background-color: var(--bg-secondary);
  border-color: var(--border-secondary);
}

.theme-btn.active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: white;
}

.theme-btn.active:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

/* Dark mode spezifische Anpassungen */
:global(.dark) .theme-btn {
  border-color: #374151;
}

:global(.dark) .theme-btn:hover {
  background-color: #374151;
  border-color: #4b5563;
}
</style>
