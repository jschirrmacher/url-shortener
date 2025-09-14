export default defineNuxtConfig({
  devtools: { enabled: true },

  // Compatibility Date
  compatibilityDate: "2025-07-26",

  // CSS Framework - verwende Tailwind CSS direkt
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/eslint"],

  // PostCSS Konfiguration
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

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