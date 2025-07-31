import type { User } from "~/types/index"

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  user: User
  message?: string
}

interface ApiError {
  data?: {
    message?: string
  }
  message?: string
}

export const useAuth = () => {
  // Globaler State mit useState (Nuxt3)
  const user = useState<User | null>("auth.user", () => null)

  const isAuthenticated = computed((): boolean => !!user.value)
  const isAdmin = computed((): boolean => user.value?.role === "admin")

  // Lade aktuellen Benutzer
  const fetchUser = async (): Promise<User> => {
    try {
      const response = await $fetch<{ user: User }>("/api/auth/me")
      user.value = response.user
      return response.user
    } catch (error: unknown) {
      user.value = null
      throw error
    }
  }

  // Login
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await $fetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { username, password },
    })

    if (response.success) {
      user.value = response.user
    }

    return response
  }

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
      })
    } finally {
      user.value = null
      await navigateTo("/login")
    }
  }

  // Prüfe Auth Status beim Start
  const initAuth = async (): Promise<void> => {
    try {
      await fetchUser()
    } catch {
      // Nicht angemeldet - ignorieren
      user.value = null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser,
    initAuth,
  }
}
