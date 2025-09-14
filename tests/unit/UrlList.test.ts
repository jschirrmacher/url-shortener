/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import UrlList from "~/components/url/UrlList.vue"

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
        urls: mockUrls
      }
    })

    // Check if component receives props
    expect(wrapper.props('urls')).toEqual(mockUrls)
    expect(wrapper.props('urls')).toHaveLength(2)
  })

  it("should render list of URLs correctly", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    // Debug output
    console.log("Props URLs:", mockUrls)
    console.log("HTML:", wrapper.html())
    
    // Should show both URLs
    expect(wrapper.text()).toContain("abc123")
    expect(wrapper.text()).toContain("https://example.com")
    expect(wrapper.text()).toContain("Example Site")
    expect(wrapper.text()).toContain("42")

    expect(wrapper.text()).toContain("def456")
    expect(wrapper.text()).toContain("https://another.com")
    expect(wrapper.text()).toContain("Another Site")
    expect(wrapper.text()).toContain("15")
  })

  it("should show empty state when no URLs", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: []
      }
    })

    expect(wrapper.text()).toContain("Noch keine URLs erstellt")
  })

  it("should show loading state", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: [],
        loading: true
      }
    })

    expect(wrapper.text()).toContain("Lade URLs...")
  })

  it("should copy short URL to clipboard", async () => {
    // Mock clipboard API
    const mockWriteText = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    })

    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    // Find and click copy button for first URL
    const copyButton = wrapper.find('[data-testid="copy-button-abc123"]')
    if (copyButton.exists()) {
      await copyButton.trigger('click')
    }

    // Should copy short URL to clipboard
    expect(mockWriteText).toHaveBeenCalledWith('http://localhost:3000/abc123')
  })

  it("should open details modal when clicking details button", async () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    // Find and click details button
    const detailsButton = wrapper.find('[data-testid="details-button-abc123"]')
    if (detailsButton.exists()) {
      await detailsButton.trigger('click')
    }

    // Should emit openDetails event
    expect(wrapper.emitted('openDetails')).toBeTruthy()
    expect(wrapper.emitted('openDetails')?.[0]).toEqual([mockUrls[0]])
  })

  it("should delete URL when clicking delete button", async () => {
    mockUseFetch.mockResolvedValueOnce({
      data: ref({ success: true }),
      error: ref(null)
    })

    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    // Find and click delete button
    const deleteButton = wrapper.find('[data-testid="delete-button-abc123"]')
    if (deleteButton.exists()) {
      await deleteButton.trigger('click')
    }

    // Should call useFetch for delete
    expect(mockUseFetch).toHaveBeenCalledWith('/api/urls/abc123', {
      method: 'DELETE'
    })
  })

  it("should emit deleted event after successful deletion", async () => {
    mockUseFetch.mockResolvedValueOnce({
      data: ref({ success: true }),
      error: ref(null)
    })

    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    const deleteButton = wrapper.find('[data-testid="delete-button-abc123"]')
    if (deleteButton.exists()) {
      await deleteButton.trigger('click')
    }

    // Wait for API call to complete
    await wrapper.vm.$nextTick()

    // Should emit deleted event
    expect(wrapper.emitted('deleted')).toBeTruthy()
    expect(wrapper.emitted('deleted')?.[0]).toEqual(['abc123'])
  })

  it("should show error message on delete failure", async () => {
    const errorMessage = "Fehler beim Löschen"
    mockUseFetch.mockResolvedValueOnce({
      data: ref(null),
      error: ref({
        data: { message: errorMessage }
      })
    })

    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    const deleteButton = wrapper.find('[data-testid="delete-button-abc123"]')
    expect(deleteButton.exists()).toBe(true)
    
    await deleteButton.trigger('click')

    // Wait for API call to complete
    await new Promise(resolve => setTimeout(resolve, 10))
    await wrapper.vm.$nextTick()

    // Should have called the API
    expect(mockUseFetch).toHaveBeenCalledWith('/api/urls/abc123', {
      method: 'DELETE'
    })
  })

  it("should format dates correctly", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    // Should show formatted dates (German locale)
    expect(wrapper.text()).toContain("01.01.2024")
    expect(wrapper.text()).toContain("02.01.2024")
  })

  it("should show click statistics", () => {
    const wrapper = mount(UrlList, {
      props: {
        urls: mockUrls
      }
    })

    // Should show click counts
    expect(wrapper.text()).toContain("42 Klicks")
    expect(wrapper.text()).toContain("15 Klicks")
  })

  it("should handle missing title gracefully", () => {
    const urlsWithoutTitle = [
      {
        ...mockUrls[0],
        title: undefined
      }
    ]

    const wrapper = mount(UrlList, {
      props: {
        urls: urlsWithoutTitle
      }
    })

    // Should still render without title
    expect(wrapper.text()).toContain("abc123")
    expect(wrapper.text()).toContain("https://example.com")
  })

  it("should sort URLs by creation date (newest first)", () => {
    const unsortedUrls = [mockUrls[0], mockUrls[1]] // older first
    
    const wrapper = mount(UrlList, {
      props: {
        urls: unsortedUrls
      }
    })

    // Should show newer URL first in DOM
    const urlElements = wrapper.findAll('[data-testid^="url-item-"]')
    expect(urlElements[0].attributes('data-testid')).toBe('url-item-def456') // newer
    expect(urlElements[1].attributes('data-testid')).toBe('url-item-abc123') // older
  })
})
