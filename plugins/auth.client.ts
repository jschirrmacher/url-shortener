export default defineNuxtPlugin(async () => {
  // Nur auf Client-Seite ausführen
  if (import.meta.client) {
    const { initAuth } = useAuth()

    // Initialisiere Auth beim App-Start
    try {
      await initAuth()
    } catch {
      // Auth initialization failed - user is not logged in
      // This is expected behavior for unauthenticated users
    }
  }
})
