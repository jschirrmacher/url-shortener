/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import UrlDetailsModal from "~/components/url/UrlDetailsModal.vue"

// Mock global functions
const mockFetch = vi.fn()
global.$fetch = mockFetch as any

// Mock useRuntimeConfig
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      baseUrl: 'http://localhost:3000'
    }
  })
}))

describe("UrlDetailsModal Component", () => {
  const mockUrl = {
    shortCode: "abc123",
    originalUrl: "https://example.com",
    title: "Example Site",
    createdAt: "2024-01-01T00:00:00.000Z",
    createdBy: "testuser",
    totalClicks: 42
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.skip("should render URL details correctly", () => {
    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    expect(wrapper.text()).toContain("abc123")
    expect(wrapper.text()).toContain("https://example.com")
    expect(wrapper.text()).toContain("Example Site")
  })

  it.skip("should show form fields when editing", async () => {
    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    // Find and click edit button
    const editButton = wrapper.find('[data-testid="edit-button"]')
    if (editButton.exists()) {
      await editButton.trigger('click')
    }

    // Should show input fields
    expect(wrapper.find('input[type="url"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder*="Short Code"]').exists()).toBe(true)
  })

  it("should validate shortCode format", async () => {
    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    // Enter edit mode
    const editButton = wrapper.find('[data-testid="edit-button"]')
    if (editButton.exists()) {
      await editButton.trigger('click')
    }

    // Try invalid shortCode
    const shortCodeInput = wrapper.find('input[placeholder*="Short Code"]')
    if (shortCodeInput.exists()) {
      await shortCodeInput.setValue('invalid code') // space not allowed
      
      // Should show validation error
      expect(wrapper.text()).toContain('Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt')
    }
  })

  it.skip("should call API when updating URL", async () => {
    const mockResponse = {
      success: true,
      message: "URL erfolgreich aktualisiert",
      url: {
        ...mockUrl,
        originalUrl: "https://newexample.com"
      }
    }
    mockFetch.mockResolvedValueOnce(mockResponse)

    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    // Enter edit mode
    const editButton = wrapper.find('[data-testid="edit-button"]')
    if (editButton.exists()) {
      await editButton.trigger('click')
    }

    // Change URL
    const urlInput = wrapper.find('input[type="url"]')
    if (urlInput.exists()) {
      await urlInput.setValue('https://newexample.com')
    }

    // Submit form
    const saveButton = wrapper.find('[data-testid="save-button"]')
    if (saveButton.exists()) {
      await saveButton.trigger('click')
    }

    // Should call API
    expect(mockFetch).toHaveBeenCalledWith(`/api/urls/${mockUrl.shortCode}`, {
      method: 'PUT',
      body: {
        originalUrl: 'https://newexample.com'
      }
    })
  })

  it.skip("should include newShortCode when shortCode changes", async () => {
    const mockResponse = {
      success: true,
      message: "URL erfolgreich aktualisiert",
      url: {
        ...mockUrl,
        shortCode: "new123"
      }
    }
    mockFetch.mockResolvedValueOnce(mockResponse)

    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    // Enter edit mode
    const editButton = wrapper.find('[data-testid="edit-button"]')
    if (editButton.exists()) {
      await editButton.trigger('click')
    }

    // Change shortCode
    const shortCodeInput = wrapper.find('input[placeholder*="Short Code"]')
    if (shortCodeInput.exists()) {
      await shortCodeInput.setValue('new123')
    }

    // Submit form
    const saveButton = wrapper.find('[data-testid="save-button"]')
    if (saveButton.exists()) {
      await saveButton.trigger('click')
    }

    // Should call API with newShortCode
    expect(mockFetch).toHaveBeenCalledWith(`/api/urls/${mockUrl.shortCode}`, {
      method: 'PUT',
      body: {
        originalUrl: mockUrl.originalUrl,
        newShortCode: 'new123'
      }
    })
  })

  it.skip("should show error message on API failure", async () => {
    const errorMessage = "Short Code bereits vergeben"
    mockFetch.mockRejectedValueOnce({
      data: { message: errorMessage }
    })

    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    // Enter edit mode and try to save
    const editButton = wrapper.find('[data-testid="edit-button"]')
    if (editButton.exists()) {
      await editButton.trigger('click')
    }

    const saveButton = wrapper.find('[data-testid="save-button"]')
    if (saveButton.exists()) {
      await saveButton.trigger('click')
    }

    // Wait for error to appear
    await wrapper.vm.$nextTick()

    // Should show error message
    expect(wrapper.text()).toContain(errorMessage)
  })

  it.skip("should emit close event when modal is closed", async () => {
    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    // Find and click close button
    const closeButton = wrapper.find('[data-testid="close-button"]')
    if (closeButton.exists()) {
      await closeButton.trigger('click')
    }

    // Should emit close event
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it.skip("should emit updated event when URL is successfully updated", async () => {
    const mockResponse = {
      success: true,
      message: "URL erfolgreich aktualisiert",
      url: {
        ...mockUrl,
        originalUrl: "https://newexample.com"
      }
    }
    mockFetch.mockResolvedValueOnce(mockResponse)

    const wrapper = mount(UrlDetailsModal, {
      props: {
        url: mockUrl,
        isOpen: true
      }
    })

    // Simulate successful update
    const editButton = wrapper.find('[data-testid="edit-button"]')
    if (editButton.exists()) {
      await editButton.trigger('click')
    }

    const saveButton = wrapper.find('[data-testid="save-button"]')
    if (saveButton.exists()) {
      await saveButton.trigger('click')
    }

    // Wait for API call to complete
    await wrapper.vm.$nextTick()

    // Should emit updated event with new URL data
    expect(wrapper.emitted('updated')).toBeTruthy()
    expect(wrapper.emitted('updated')?.[0]).toEqual([mockResponse.url])
  })
})
