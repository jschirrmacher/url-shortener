/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import StatsPage from "~/pages/stats/[shortCode].vue"
import { mockStats, mockLoading, mockLoadingMore, mockError } from "../setup"

// Mock the store
vi.mock('~/stores/stats', () => ({
  useStatsStore: () => ({
    stats: mockStats,
    loading: mockLoading,
    loadingMore: mockLoadingMore,
    error: mockError,
    loadStats: vi.fn(),
    loadPrevStats: vi.fn(),
    loadNextStats: vi.fn()
  })
}))

// Mock components
const MockUrlItem = {
  name: 'UrlItem',
  template: '<div data-testid="url-item">URL Item</div>',
  props: ['url', 'showActions']
}

const MockStatsOverview = {
  name: 'StatsOverview',
  template: '<div data-testid="stats-overview">Stats Overview</div>'
}

const MockSourceBreakdown = {
  name: 'SourceBreakdown',
  template: '<div data-testid="source-breakdown">Source Breakdown</div>'
}

const MockRecentClicks = {
  name: 'RecentClicks',
  template: '<div data-testid="recent-clicks">Recent Clicks</div>'
}

const MockBaseButton = {
  name: 'BaseButton',
  template: '<button><slot /></button>',
  props: ['variant']
}

// Mock composables
vi.stubGlobal('useRoute', () => ({
  params: { shortCode: 'abc123' }
}))

vi.stubGlobal('useAuthPageStandard', () => ({
  user: { value: { username: 'testuser' } }
}))

vi.stubGlobal('onMounted', vi.fn())

describe("Stats Page Snapshot", () => {
  const mockStatsData = {
    url: {
      shortCode: "abc123",
      originalUrl: "https://example.com",
      title: "Example Site",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "testuser"
    },
    totalClicks: 42,
    uniqueVisitors: 15,
    dailyStats: [
      { date: '2024-01-01', clicks: 10, uniqueVisitors: 8 },
      { date: '2024-01-02', clicks: 15, uniqueVisitors: 12 }
    ],
    sourceBreakdown: {
      direct: 20,
      referral: 22
    },
    topReferrers: [
      { referrer: "google.com", count: 15 },
      { referrer: "facebook.com", count: 7 }
    ],
    hasMore: false,
    _links: {
      self: { href: '/api/urls/abc123/stats' },
      first: { href: '/api/urls/abc123/stats' },
      url: { href: '/abc123' }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should match snapshot with stats data", () => {
    mockStats.value = mockStatsData
    mockLoading.value = false
    mockError.value = ""

    const wrapper = mount(StatsPage, {
      global: {
        components: {
          UrlItem: MockUrlItem,
          StatsOverview: MockStatsOverview,
          SourceBreakdown: MockSourceBreakdown,
          RecentClicks: MockRecentClicks,
          BaseButton: MockBaseButton
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should match snapshot in loading state", () => {
    mockStats.value = null
    mockLoading.value = true
    mockError.value = ""

    const wrapper = mount(StatsPage, {
      global: {
        components: {
          UrlItem: MockUrlItem,
          StatsOverview: MockStatsOverview,
          SourceBreakdown: MockSourceBreakdown,
          RecentClicks: MockRecentClicks,
          BaseButton: MockBaseButton
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
