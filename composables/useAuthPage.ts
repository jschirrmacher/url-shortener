// Zentrale Auth-Logik für Seiten

interface AuthPageOptions {
  title: string
  requireAdmin?: boolean
  layout?: boolean | string
}

/**
 * Zentrale Auth-Funktion für Seiten
 * Übernimmt useHead, definePageMeta und Auth-Prüfung
 */
export function useAuthPage(options: AuthPageOptions) {
  // Set page title
  useHead({ title: options.title })

  // Set page meta based on requirements
  if (options.layout === false) {
    // Public pages (login, redirect)
    definePageMeta({ layout: false })
  } else if (options.requireAdmin) {
    // Admin pages
    definePageMeta({ middleware: ['auth', 'admin'] })
  } else {
    // Regular auth pages
    definePageMeta({ middleware: 'auth' })
  }

  // Get auth composable
  const { user, initAuth } = useAuth()

  // Auth initialization and redirect logic
  onMounted(async (): Promise<void> => {
    // Skip auth check for public pages
    if (options.layout === false) {
      return
    }

    await initAuth()

    if (!user.value) {
      await navigateTo('/login')
      return
    }

    // Check admin requirement
    if (options.requireAdmin && user.value.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin-Berechtigung erforderlich',
      })
    }
  })

  return {
    user,
    initAuth,
  }
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
  return useAuthPage({ title, requireAdmin: true })
}

/**
 * Shorthand für öffentliche Seiten
 */
export function usePublicPage(title: string) {
  return useAuthPage({ title, layout: false })
}
