// Zentrale Auth-Logik für Seiten

type Role = 'admin' | 'user'

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
    definePageMeta({ middleware: 'auth' })
  }

  // Get auth composable
  const auth = useAuth()

  // Auth initialization and redirect logic
  onMounted(async (): Promise<void> => {
    if (!options.public) {
      await auth.initAuth()

      if (!auth.user.value) {
        await navigateTo('/login')
        return
      }
      if (options.requireRole && auth.user.value.role !== options.requireRole) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin-Berechtigung erforderlich',
        })
      }
    }
  })

  return auth
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
  return useAuthPage({ title, requireRole: 'admin' })
}

/**
 * Shorthand für öffentliche Seiten
 */
export function usePublicPage(title: string) {
  return useAuthPage({ title, public: true })
}
