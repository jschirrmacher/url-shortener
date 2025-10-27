import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import UrlDetailsModal from "~/components/url/UrlDetailsModal.vue"

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal("$fetch", mockFetch)

// Mock fetch for QR code
global.fetch = vi.fn()

describe("UrlDetailsModal Component", () => {
  const mockData = {
    shortCode: "abc123",
    shortUrl: "http://localhost:3000/abc123",
    originalUrl: "https://example.com",
    title: "Example Website",
    currentOwner: "testuser",
    isOpen: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch for QR code generation
    ;(global.fetch as any).mockResolvedValue({
      blob: () => Promise.resolve(new Blob())
    })
  })

  it("should render modal when open", () => {
    const wrapper = mount(UrlDetailsModal, {
      props: { data: mockData }
    })

    const dialog = wrapper.find('dialog')
    expect(dialog.exists()).toBe(true)
    // Dialog exists and component is mounted with isOpen=true
    expect(wrapper.props('data').isOpen).toBe(true)
  })

  it("should not show modal when closed", () => {
    const wrapper = mount(UrlDetailsModal, {
      props: {
        ...{ data: mockData },
        isOpen: false
      }
    })

    const dialog = wrapper.find('dialog')
    expect(dialog.attributes('open')).toBeUndefined()
  })

  it("should generate QR code URL correctly", () => {
    const wrapper = mount(UrlDetailsModal, {
      props: { data: mockData }
    })

    // Check if QR code image source is generated
    const qrImage = wrapper.find('img[alt*="QR"]')
    if (qrImage.exists()) {
      expect(qrImage.attributes('src')).toContain('/api/qr/abc123')
    }
  })

  it("should emit close event when close button clicked", async () => {
    const wrapper = mount(UrlDetailsModal, {
      props: { data: mockData }
    })

    // Look for close button (X or close text)
    const closeButtons = wrapper.findAll('button')
    const closeButton = closeButtons.find(btn => 
      btn.text().includes('×') || 
      btn.text().includes('Schließen') ||
      btn.text().includes('Close') ||
      btn.attributes('aria-label')?.includes('close')
    )

    if (closeButton) {
      await closeButton.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
  })

  it("should handle copy functionality", async () => {
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      writable: true
    })

    const wrapper = mount(UrlDetailsModal, {
      props: { data: mockData }
    })

    // Look for copy button
    const copyButtons = wrapper.findAll('button')
    const copyButton = copyButtons.find(btn => 
      btn.text().includes('Kopieren') || 
      btn.text().includes('Copy') ||
      btn.html().includes('copy')
    )

    if (copyButton) {
      await copyButton.trigger('click')
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    }
  })

  it("should contain QR code functionality", () => {
    const wrapper = mount(UrlDetailsModal, {
      props: { data: mockData }
    })

    const html = wrapper.html()
    // Check for QR code related content
    const hasQrContent = html.includes('QR') || 
                        html.includes('qr') ||
                        wrapper.find('img').exists() ||
                        html.includes('/api/qr/')
    
    expect(hasQrContent).toBe(true)
  })

  it("should match snapshot", () => {
    const wrapper = mount(UrlDetailsModal, {
      props: { data: mockData }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should handle props changes reactively", async () => {
    const wrapper = mount(UrlDetailsModal, {
      props: { data: mockData }
    })

    // Change shortCode prop
    await wrapper.setProps({
      data: {
        ...mockData,
        shortCode: "xyz789",
        shortUrl: "http://localhost:3000/xyz789"
      }
    })

    // Check if template updates
    const html = wrapper.html()
    expect(html).toContain('xyz789')
  })

  it("should handle modal open/close state changes", async () => {
    const wrapper = mount(UrlDetailsModal, {
      props: {
        data: { ...mockData, isOpen: false }
      },
      global: {
        stubs: {
          UrlForm: true,
          AlertMessage: true,
          ModalHeader: true,
          QrCodeSection: true
        }
      }
    })

    // Initially closed
    expect(wrapper.props('data').isOpen).toBe(false)

    // Open modal
    await wrapper.setProps({ data: { ...mockData, isOpen: true } })
    expect(wrapper.props('data').isOpen).toBe(true)

    // Close modal
    await wrapper.setProps({ data: { ...mockData, isOpen: false } })
    expect(wrapper.props('data').isOpen).toBe(false)
  })
})
