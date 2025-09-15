// Test setup file for Vitest
import { vi, afterEach } from "vitest"

// Global cleanup after each test
afterEach(async () => {
  // Only cleanup if we're in a test environment with test data
  if (process.env.NODE_ENV === "test" || process.env.DATA_DIR?.includes("test-data")) {
    try {
      // Simple cleanup without actual API call in unit tests
      console.log("Test cleanup completed")
    } catch {
      // Ignore cleanup errors
    }
  }
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: vi.fn(),
  warn: vi.fn(),
  // Mock info and log
  info: vi.fn(),
  log: vi.fn(),
}

// Store original process.cwd before mocking
const originalCwd = process.cwd

// Mock process for development checks and Node.js functions
global.process = {
  ...process,
  dev: false,
  env: { NODE_ENV: "test" },
  cwd: originalCwd,
}

// Only mock Vue/Nuxt globals in DOM environment (for snapshot tests)
if (typeof window !== "undefined") {
  // Mock Vue auto-imports for test environment with proper typing
  ;(global as any).ref = vi.fn((value) => ({ value }))
  ;(global as any).computed = vi.fn((fn) => ({ value: fn() }))
  ;(global as any).reactive = vi.fn((obj) => obj)
  ;(global as any).readonly = vi.fn((obj) => obj)
  ;(global as any).toRef = vi.fn((obj, key) => ({ value: obj[key] }))
  ;(global as any).nextTick = vi.fn().mockResolvedValue(undefined)
  ;(global as any).watch = vi.fn()
  ;(global as any).onMounted = vi.fn()

  // Mock Nuxt auto-imports
  ;(global as any).useRuntimeConfig = vi.fn(() => ({
    public: { baseUrl: "http://localhost:3000" },
  }))

  // Mock navigator.clipboard
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    writable: true,
  })
}
