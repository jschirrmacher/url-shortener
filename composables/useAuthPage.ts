// Zentrale Auth-Logik für Seiten

type Role = "admin" | "user"

interface AuthPageOptions {
  title: string
  requireRole?: Role
  public?: boolean
}

/**
 * Zentrale Auth-Funktion für Seiten
 * Übernimmt useHead, definePageMeta und Auth-Prüfung
 */
export function useAuthPage(options: AuthPageOptions) {
  // Set page title
  useHead({ title: options.title })

  // Set page meta based on requirements
  if (options.public) {
    // Public pages (login, redirect)
    definePageMeta({ layout: false })
  } else {
    // All protected pages only need auth middleware
    definePageMeta({ middleware: "auth" })
  }

  // Only initialize auth on client-side to prevent SSR issues
  let auth: ReturnType<typeof useAuth> | null = null

  // Initialize auth composable only on client-side
  if (import.meta.client) {
    auth = useAuth()
  }

  // Auth initialization and redirect logic - client-side only
  onMounted(async () => {
    // Skip auth logic for public pages or during SSR
    if (options.public || import.meta.server) {
      return
    }

    // Initialize auth if not already done
    if (!auth) {
      auth = useAuth()
    }

    try {
      await auth.initAuth()

      if (!auth.user.value) {
        await navigateTo("/login")
        return
      }

      if (options.requireRole && auth.user.value.role !== options.requireRole) {
        throw createError({
          statusCode: 403,
          statusMessage: "Admin-Berechtigung erforderlich",
        })
      }
    } catch {
      // Authentication failed - redirect to login
      await navigateTo("/login")
    }
  })

  // Return auth composable or a safe fallback for SSR
  return (
    auth || {
      user: readonly(ref(null)),
      isAuthenticated: computed(() => false),
      isAdmin: computed(() => false),
      login: async () => ({ success: false, user: null }),
      logout: async () => {},
      fetchUser: async () => {
        throw new Error("Not available during SSR")
      },
      initAuth: async () => {},
    }
  )
}

/**
 * Shorthand für Standard-Auth-Seiten
 */
export function useAuthPageStandard(title: string) {
  return useAuthPage({ title })
}

/**
 * Shorthand für Admin-Seiten
 */
export function useAuthPageAdmin(title: string) {
  return useAuthPage({ title, requireRole: "admin" })
}

/**
 * Shorthand für öffentliche Seiten
 */
export function usePublicPage(title: string) {
  return useAuthPage({ title, public: true })
}
