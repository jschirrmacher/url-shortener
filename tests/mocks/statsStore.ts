import { vi } from 'vitest'
import { ref } from 'vue'
import type { UrlStats } from '~/types/index'

export const createMockStatsStore = (initialStats?: UrlStats | null) => {
  const stats = ref<UrlStats | null>(initialStats || null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref('')

  return {
    stats,
    loading,
    loadingMore,
    error,
    loadStats: vi.fn(),
    loadPrevStats: vi.fn(),
    loadNextStats: vi.fn()
  }
}

// Global mock for useStatsStore
export const mockStatsStore = createMockStatsStore()

// Mock the composable
vi.mock('~/stores/stats', () => ({
  useStatsStore: () => mockStatsStore
}))
