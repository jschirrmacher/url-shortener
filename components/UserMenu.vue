<script setup lang="ts">
// Auth
const { user, logout } = useAuth()

// Reactive Data
const isOpen = ref<boolean>(false)

// Methods
const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const closeDropdown = (): void => {
  isOpen.value = false
}

const handleLogout = async (): Promise<void> => {
  try {
    closeDropdown()
    await logout()
    await navigateTo("/login")
  } catch {
    // Error during logout - redirect anyway for security
    await navigateTo("/login")
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement
    if (!target.closest(".user-menu")) {
      closeDropdown()
    }
  })
})
</script>

<template>
  <div v-if="user" class="relative user-menu">
    <!-- Dropdown Button -->
    <BaseButton variant="secondary" @click="toggleDropdown">
      <!-- User Avatar -->
      <div
        class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2"
      >
        {{ user.username.charAt(0).toUpperCase() }}
      </div>

      <!-- User Info -->
      <div class="flex flex-col items-start mr-2">
        <span class="font-medium text-gray-900">{{ user.username }}</span>
      </div>

      <!-- Dropdown Arrow -->
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </BaseButton>
    <!-- Dropdown Menu -->
    <div v-show="isOpen" class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div class="py-2">
        <!-- Menu Items -->
        <div class="py-1">
          <!-- Profile -->
          <NuxtLink
            to="/profile"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="closeDropdown"
          >
            <span class="mr-3">👤</span>
            Mein Profil
          </NuxtLink>

          <!-- Admin (nur für Admins) -->
          <NuxtLink
            v-if="user.role === 'admin'"
            to="/admin"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="closeDropdown"
          >
            <span class="mr-3">⚙️</span>
            Administration
          </NuxtLink>

          <!-- Divider -->
          <div class="border-t border-gray-100 my-1" />

          <!-- Logout -->
          <BaseButton variant="ghost" size="sm" full-width @click="handleLogout">
            <span class="mr-3">🚪</span>
            Abmelden
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure dropdown appears above other elements */
.user-menu {
  z-index: 1000;
}

/* Smooth transitions */
.user-menu button {
  transition: all 0.2s ease-in-out;
}

.user-menu button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
