import type { User } from "~/types/index"

export const useUsersStore = defineStore("users", () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  async function loadUsers() {
    if (users.value.length > 0) return // Already loaded
    
    try {
      loading.value = true
      const data = await $fetch<User[]>("/api/admin/users")
      users.value = data
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    loadUsers,
  }
})
