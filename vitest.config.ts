import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**/*"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["utils/**", "server/**"],
      exclude: ["tests/**", "**/*.test.ts", "**/*.spec.ts"],
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
