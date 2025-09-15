/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import StatsPage from "~/pages/stats/[shortCode].vue"

// Mock components
const MockUrlItem = {
  name: 'UrlItem',
  template: '<div data-testid="url-item">URL Item</div>',
  props: ['url', 'showActions']
}

const MockStatsOverview = {
  name: 'StatsOverview',
  template: '<div data-testid="stats-overview">Stats Overview</div>',
  props: ['stats']
}

const MockSourceBreakdown = {
  name: 'SourceBreakdown',
  template: '<div data-testid="source-breakdown">Source Breakdown</div>',
  props: ['stats']
}

const MockRecentClicks = {
  name: 'RecentClicks',
  template: '<div data-testid="recent-clicks">Recent Clicks</div>',
  props: ['stats']
}

const MockBaseButton = {
  name: 'BaseButton',
  template: '<button><slot /></button>',
  props: ['variant']
}

// Mock composables
vi.mock('#app', () => ({
  useRoute: () => ({
    params: { shortCode: 'abc123' }
  }),
  useRouter: () => ({
    push: vi.fn()
  }),
  useRuntimeConfig: () => ({
    public: {
      baseUrl: 'http://localhost:3000'
    }
  })
}))

// Mock Nuxt composables
vi.stubGlobal('useRoute', () => ({
  params: { shortCode: 'abc123' }
}))

vi.stubGlobal('useRouter', () => ({
  push: vi.fn()
}))

vi.stubGlobal('useAuthPageStandard', () => ({
  user: { value: { username: 'testuser' } }
}))

// Mock $fetch
vi.stubGlobal('$fetch', vi.fn())

describe("Stats Page Snapshot", () => {
  const mockStats = {
    url: {
      shortCode: "abc123",
      originalUrl: "https://example.com",
      title: "Example Site",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "testuser"
    },
    totalClicks: 42,
    uniqueVisitors: 15,
    sourceBreakdown: {
      direct: 20,
      referral: 22
    },
    topReferrers: [
      { referrer: "google.com", clicks: 15 },
      { referrer: "facebook.com", clicks: 7 }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should match snapshot with stats data", () => {
    const wrapper = mount(StatsPage, {
      global: {
        components: {
          UrlItem: MockUrlItem,
          StatsOverview: MockStatsOverview,
          SourceBreakdown: MockSourceBreakdown,
          RecentClicks: MockRecentClicks,
          BaseButton: MockBaseButton
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      },
      data() {
        return {
          loading: false,
          error: "",
          stats: mockStats
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should match snapshot in loading state", () => {
    const wrapper = mount(StatsPage, {
      global: {
        components: {
          UrlItem: MockUrlItem,
          StatsOverview: MockStatsOverview,
          SourceBreakdown: MockSourceBreakdown,
          RecentClicks: MockRecentClicks,
          BaseButton: MockBaseButton
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      },
      data() {
        return {
          loading: true,
          error: "",
          stats: null
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
