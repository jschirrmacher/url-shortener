/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import UrlList from "~/components/url/UrlList.vue"

// Mock child components
const MockUrlListHeader = {
  name: 'UrlListHeader',
  template: '<div data-testid="url-list-header">Header</div>',
  props: ['loading'],
  emits: ['refresh']
}

const MockUrlItem = {
  name: 'UrlItem',
  template: '<div data-testid="url-item">{{ url.shortCode }}</div>',
  props: ['url'],
  emits: ['openDetails', 'delete']
}

const MockLoadingSpinner = {
  name: 'LoadingSpinner',
  template: '<div data-testid="loading-spinner">Lade URLs...</div>',
  props: ['message']
}

const MockEmptyState = {
  name: 'EmptyState',
  template: '<div data-testid="empty-state">Noch keine URLs erstellt</div>',
  props: ['title', 'description', 'icon']
}

const MockUrlDetailsModal = {
  name: 'UrlDetailsModal',
  template: '<div data-testid="url-details-modal"></div>',
  props: ['shortCode', 'shortUrl', 'originalUrl', 'isOpen'],
  emits: ['close', 'updated']
}

// Mock useFetch
const mockUseFetch = vi.fn()

// Mock useRuntimeConfig
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      baseUrl: 'http://localhost:3000'
    }
  })
}))

// Mock useFetch globally
vi.stubGlobal('useFetch', mockUseFetch)

describe("UrlList Component", () => {
  const mockUrls = [
    {
      shortCode: "abc123",
      originalUrl: "https://example.com",
      title: "Example Site",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "testuser",
      totalClicks: 42
    },
    {
      shortCode: "def456",
      originalUrl: "https://another.com",
      title: "Another Site",
      createdAt: "2024-01-02T00:00:00.000Z",
      createdBy: "testuser",
      totalClicks: 15
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should receive props correctly", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls,
        loading: false,
        error: null
      },
      global: {
        components: {
          UrlListHeader: MockUrlListHeader,
          UrlItem: MockUrlItem,
          LoadingSpinner: MockLoadingSpinner,
          EmptyState: MockEmptyState,
          UrlDetailsModal: MockUrlDetailsModal
        }
      }
    })

    expect(wrapper.props('urls')).toEqual(mockUrls)
    expect(wrapper.props('urls')).toHaveLength(2)
  })

  it("should render list of URLs correctly", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls,
        loading: false,
        error: null
      },
      global: {
        components: {
          UrlListHeader: MockUrlListHeader,
          UrlItem: MockUrlItem,
          LoadingSpinner: MockLoadingSpinner,
          EmptyState: MockEmptyState,
          UrlDetailsModal: MockUrlDetailsModal
        }
      }
    })

    // Should show both URLs via UrlItem components
    const urlItems = wrapper.findAllComponents({ name: 'UrlItem' })
    expect(urlItems).toHaveLength(2)
    expect(wrapper.text()).toContain("abc123")
    expect(wrapper.text()).toContain("def456")
  })

  it("should show empty state when no URLs", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: [],
        loading: false,
        error: null
      },
      global: {
        components: {
          UrlListHeader: MockUrlListHeader,
          UrlItem: MockUrlItem,
          LoadingSpinner: MockLoadingSpinner,
          EmptyState: MockEmptyState,
          UrlDetailsModal: MockUrlDetailsModal
        }
      }
    })

    expect(wrapper.findComponent({ name: 'EmptyState' }).exists()).toBe(true)
    expect(wrapper.text()).toContain("Noch keine URLs erstellt")
  })

  it("should show loading state", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: [],
        loading: true,
        error: null
      },
      global: {
        components: {
          UrlListHeader: MockUrlListHeader,
          UrlItem: MockUrlItem,
          LoadingSpinner: MockLoadingSpinner,
          EmptyState: MockEmptyState,
          UrlDetailsModal: MockUrlDetailsModal
        }
      }
    })

    expect(wrapper.findComponent({ name: 'LoadingSpinner' }).exists()).toBe(true)
    expect(wrapper.text()).toContain("Lade URLs...")
  })

  it("should show error message", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: [],
        loading: false,
        error: "Test error message"
      },
      global: {
        components: {
          UrlListHeader: MockUrlListHeader,
          UrlItem: MockUrlItem,
          LoadingSpinner: MockLoadingSpinner,
          EmptyState: MockEmptyState,
          UrlDetailsModal: MockUrlDetailsModal
        }
      }
    })

    expect(wrapper.text()).toContain("Test error message")
  })
})
