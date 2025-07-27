export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Compatibility Date
  compatibilityDate: '2025-07-26',

  // CSS Framework - verwende Tailwind CSS direkt
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],

  // Server-side Rendering
  ssr: true,

  // Runtime Config für Umgebungsvariablen
  runtimeConfig: {
    // Private keys (nur server-side verfügbar)
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    
    // Public keys (client-side verfügbar)
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    }
  },

  // Auto-Import Konfiguration
  imports: {
    dirs: [
      'composables/**',
      'utils/**',
      'types/**'
    ],
    // Explizit definePageMeta importieren
    presets: [
      {
        from: '#app',
        imports: ['definePageMeta']
      }
    ]
  }
})
