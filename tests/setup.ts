import { vi } from 'vitest'
import { ref } from 'vue'
import type { UrlStats } from '~/types/index'
import { config } from '@vue/test-utils'

// Global component stubs to avoid warnings
config.global.stubs = {
  BaseButton: true,
  ModalHeader: true,
  QrCodeSection: true,
  AlertMessage: true,
  UrlForm: true,
  StackedBar: true
}

// Global mock for useStatsStore
const mockStats = ref<UrlStats | null>(null)
const mockLoading = ref(false)
const mockLoadingMore = ref(false)
const mockError = ref('')

vi.stubGlobal('useStatsStore', () => ({
  stats: mockStats,
  loading: mockLoading,
  loadingMore: mockLoadingMore,
  error: mockError,
  loadStats: vi.fn(),
  loadPrevStats: vi.fn(),
  loadNextStats: vi.fn()
}))

// Export for test access
export { mockStats, mockLoading, mockLoadingMore, mockError }
