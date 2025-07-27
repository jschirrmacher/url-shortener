import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    // Prüfe Auth-Status
    const { user, initAuth } = useAuth()

    // Initialisiere Auth falls noch nicht geschehen
    if (!user.value) {
      try {
        await initAuth()
      } catch (error: unknown) {
        console.error('Auth initialization failed:', error)
        return navigateTo('/login')
      }
    }

    // Prüfe ob Benutzer angemeldet ist
    if (!user.value) {
      return navigateTo('/login')
    }

    // Prüfe Admin-Berechtigung
    if (user.value.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Zugriff verweigert - Admin-Berechtigung erforderlich',
      })
    }
  }
)
