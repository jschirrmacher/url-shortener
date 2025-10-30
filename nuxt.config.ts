export default defineNuxtConfig({
  devtools: { enabled: true },

  // Compatibility Date
  compatibilityDate: "2025-07-26",

  // CSS Framework - natives CSS
  css: ["~/assets/css/main.css"],

  // App Head Konfiguration
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      script: [
        {
          innerHTML: `
            (function() {
              try {
                const savedTheme = localStorage.getItem('theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = savedTheme === 'dark' || (savedTheme === 'system' && systemDark) || (!savedTheme && systemDark);
                
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                // Fallback falls localStorage nicht verfügbar
              }
            })();
          `,
          type: 'text/javascript'
        }
      ]
    }
  },
  modules: ["@nuxt/eslint", "@pinia/nuxt"],

  // Server-side Rendering
  ssr: true,

  // Runtime Config für Umgebungsvariablen
  runtimeConfig: {
    baseUrl: "", // Server-seitige Basis-URL
    public: {
      baseUrl: "", // Client-seitige Basis-URL
    },
  },

  // Auto-Import Konfiguration
  imports: {
    dirs: ["composables/**", "utils/**", "types/**"],
  },

  // Komponenten Auto-Import
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
})