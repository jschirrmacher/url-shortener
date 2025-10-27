<script setup lang="ts">
const { user, logout } = useAuth()

const isOpen = ref<boolean>(false)

onMounted(() => {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement
    if (!target.closest(".user-menu")) {
      closeDropdown()
    }
  })
})

// Menu Structure
interface MenuItem {
  label?: string
  icon?: string
  to?: string
  action?: () => Promise<void>
  condition?: boolean
  divider?: boolean
}

const menuItems = computed<MenuItem[]>(() => [
  {
    label: "Mein Profil",
    icon: "👤",
    to: "/profile",
  },
  {
    label: "Administration",
    icon: "⚙️",
    to: "/admin",
    condition: user.value?.role === "admin",
  },
  {
    divider: true,
  },
  {
    label: "Abmelden",
    icon: "🚪",
    to: "/login",
    action: handleLogout,
  },
])

// Methods
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

async function handleLogout() {
  try {
    closeDropdown()
    await logout()
  } catch {
    // Error during logout - NuxtLink will still navigate to /login for security
  }
}

async function handleItemClick(item: MenuItem) {
  if (item.action) {
    await item.action()
  } else {
    closeDropdown()
  }
}
</script>

<template>
  <div v-if="user" class="relative user-menu">
    <!-- Dropdown Button -->
    <BaseButton variant="secondary" @click="toggleDropdown">
      <!-- User Avatar -->
      <UserAvatar :username="user.username" class="mr-2" />

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
    <div
      v-show="isOpen"
      class="dropdown-menu"
    >
      <div class="py-2">
        <ThemeSelector />

        <div class="py-1">
          <template v-for="(item, index) in menuItems" :key="index">
            <!-- Divider -->
            <div v-if="item.divider && (item.condition ?? true)" class="border-t border-gray-100 my-1" />

            <!-- Menu Item -->
            <NuxtLink v-else-if="item.condition ?? true" :to="item.to" class="menu-item" @click="handleItemClick(item)">
              <span class="menu-item-icon">{{ item.icon }}</span>
              {{ item.label }}
            </NuxtLink>
          </template>
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

/* Dropdown Menu Styling */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  width: 14rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 50;
}

/* Smooth transitions */
.user-menu button {
  transition: all 0.2s ease-in-out;
}

.user-menu button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Menu Item Styles */
.menu-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.15s ease-in-out;
}

.menu-item:hover {
  background-color: var(--bg-tertiary);
}

.menu-item-icon {
  margin-right: 0.75rem;
}
</style>
