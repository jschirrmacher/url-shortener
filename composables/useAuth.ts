import type { User } from "~/types/index"

interface LoginResponse {
  success: boolean
  user: User | null
  message?: string
}

export const useAuth = () => {
  // Globaler State mit useState (Nuxt3)
  const user = useState<User | null>("auth.user", () => null)

  const isAuthenticated = computed((): boolean => !!user.value)
  const isAdmin = computed((): boolean => user.value?.role === "admin")

  // Lade aktuellen Benutzer
  const fetchUser = async (): Promise<User> => {
    // Skip during SSR to prevent runtime errors
    if (import.meta.server) {
      throw new Error("fetchUser not available during SSR")
    }
    try {
      const response = await $fetch<{ user: User }>("/api/auth/me")
      user.value = response.user
      return response.user
    } catch (error: unknown) {
      user.value = null
      throw error
    }
  }

  // Login - client-side only
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    if (import.meta.server) {
      throw new Error("login not available during SSR")
    }

    try {
      const response = await $fetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: { username, password },
      })

      if (response.success) {
        user.value = response.user
      }

      return response
    } catch (error: unknown) {
      // Handle API errors and return consistent structure
      const apiError = error as { data?: { message?: string }; message?: string }
      return {
        success: false,
        user: null,
        message: apiError?.data?.message ?? apiError?.message ?? "Login fehlgeschlagen",
      }
    }
  }

  // Logout - client-side only
  const logout = async (): Promise<void> => {
    if (import.meta.server) {
      return
    }

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
    if (import.meta.server) {
      return
    }

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
