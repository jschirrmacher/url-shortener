import { createConfigForNuxt } from "@nuxt/eslint-config/flat"

export default createConfigForNuxt({
  features: {
    // Rules for module authors (defaults to `true` in modules)
    tooling: true,
    // Rules for formatting (defaults to `true` in modules)
    stylistic: false, // We use Prettier for formatting
  },
  dirs: {
    src: [
      "./components",
      "./composables",
      "./layouts",
      "./middleware",
      "./pages",
      "./plugins",
      "./server",
      "./utils",
      "./types",
    ],
  },
}).append(
  // Ignore patterns
  {
    ignores: [
      // Build outputs
      ".nuxt/**",
      ".output/**",
      "dist/**",
      "node_modules/**",
      // Generated files
      "**/*.d.ts",
      // Config files that may have different rules
      "*.config.js",
      "*.config.ts",
      "vitest.config.ts",
    ],
  },
  // Custom rules
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Vue/Nuxt specific rules
      "vue/multi-word-component-names": "off", // Allow single word component names
      "vue/no-multiple-template-root": "off", // Vue 3 allows multiple roots
      "vue/require-default-prop": "off", // Optional props are common in Nuxt

      // General JavaScript rules
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  // Test files configuration
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "tests/**/*"],
    rules: {
      "no-console": "off", // Allow console in tests
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests for mocking
    },
  },
  // Scripts configuration
  {
    files: ["scripts/**/*"],
    rules: {
      "no-console": "off", // Allow console in scripts
      "@typescript-eslint/no-unused-vars": "off", // Scripts may have unused vars for type definitions
    },
  },
  // Server API files - often have unused type imports for documentation
  {
    files: ["server/api/**/*"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
)
