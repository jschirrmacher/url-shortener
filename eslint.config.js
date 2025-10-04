import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt(
  {
    ignores: [
      "node_modules/**",
      ".nuxt/**",
      ".output/**",
      "dist/**",
      "coverage/**",
      "test-results/**",
      "data/**",
    ],
  },
  {
    // Test files configuration
    files: ["**/*.test.ts", "**/*.spec.ts", "tests/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests for mocking
    },
  }
)
