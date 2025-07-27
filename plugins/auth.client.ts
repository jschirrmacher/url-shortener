export default defineNuxtPlugin(async () => {
  // Nur auf Client-Seite ausführen
  if (import.meta.client) {
    const { initAuth } = useAuth()

    // Initialisiere Auth beim App-Start
    try {
      await initAuth()
    } catch (error) {
      // Fehler ignorieren - User ist nicht eingeloggt
      console.debug('Auth init failed:', error)
    }
  }
})
