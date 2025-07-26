import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Ignoriere Login-Seite und öffentliche Routen (Short-URLs)
  if (to.path === '/login' || to.path.match(/^\/[a-zA-Z0-9_-]+$/)) {
    return
  }

  // Nur im Browser prüfen, nicht bei SSR
  if (import.meta.server) {
    return
  }

  // Prüfe Auth Status über Composable
  const { user, initAuth } = useAuth()
  
  try {
    await initAuth()
    
    if (!user.value) {
      return navigateTo('/login')
    }
  } catch (error: unknown) {
    console.error('Auth middleware error:', error)
    return navigateTo('/login')
  }
})
