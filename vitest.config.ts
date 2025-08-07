import { defineConfig } from "vitest/config"
import { resolve } from "node:path"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "node", // Default to node for most tests
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**/*"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      all: true,
      include: [
        "components/**/*.vue",
        "pages/**/*.vue",
        "composables/**/*.ts",
        "server/**/*.ts",
        "utils/**/*.ts",
        "middleware/**/*.ts",
        "plugins/**/*.ts",
      ],
      exclude: ["node_modules/**", ".output/**", "tests/**", "**/*.test.ts", "**/*.spec.ts"],
      reporter: ["text", "json", "json-summary", "html"],
      reportsDirectory: "./coverage",
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "."),
      "@": resolve(__dirname, "."),
    },
  },
})
