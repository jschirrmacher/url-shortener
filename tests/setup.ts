// Test setup file for Vitest
import { vi } from "vitest"

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
