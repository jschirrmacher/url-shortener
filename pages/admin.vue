<script setup lang="ts">
import type { User } from "~/types/index"

const { user: _user } = useAuthPageAdmin("Administration - URL Shortener")

const users = ref<User[]>([])
const usersLoading = ref<boolean>(true)
const usersError = ref<string>("")

onMounted(async (): Promise<void> => {
  await loadUsers()
})

const loadUsers = async (): Promise<void> => {
  try {
    usersLoading.value = true
    usersError.value = ""

    const response = await $fetch<User[]>("/api/admin/users")
    users.value = response
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    usersError.value = apiError?.data?.message ?? apiError?.message ?? "Fehler beim Laden der Benutzer"
  } finally {
    usersLoading.value = false
  }
}

const handleUserCreated = (newUser: User): void => {
  users.value.push(newUser)
}

const handleUserDeleted = (username: string): void => {
  const userIndex = users.value.findIndex((u) => u.username === username)
  if (userIndex !== -1) {
    users.value[userIndex].active = false
  }
}

const handleUserReactivated = (username: string): void => {
  const userIndex = users.value.findIndex((u) => u.username === username)
  if (userIndex !== -1) {
    users.value[userIndex].active = true
  }
}

const handleRoleChanged = (username: string, newRole: "admin" | "user"): void => {
  const userIndex = users.value.findIndex((u) => u.username === username)
  if (userIndex !== -1) {
    users.value[userIndex].role = newRole
  }
}

const handlePasswordReset = (username: string): void => {
   
  console.log(`Passwort für Benutzer "${username}" wurde zurückgesetzt`)
}
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Admin-Verwaltung</h1>
      <p class="text-gray-600 mt-2">Benutzer- und Systemverwaltung</p>
    </div>
    <div class="space-y-6">
      <UserCreateForm @user-created="handleUserCreated" />
      <UserList
        :users="users"
        :loading="usersLoading"
        :error="usersError"
        @refresh="loadUsers"
        @user-deleted="handleUserDeleted"
        @user-reactivated="handleUserReactivated"
        @role-changed="handleRoleChanged"
        @password-reset="handlePasswordReset"
      />
    </div>
  </div>
</template>
