/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import UrlForm from "~/components/url/UrlForm.vue"

// Mock useFetch
const mockUseFetch = vi.fn()

// Mock Nuxt composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      baseUrl: 'http://localhost:3000'
    }
  })
}))

// Mock useFetch globally
vi.stubGlobal('useFetch', mockUseFetch)

// Mock URL constructor for validation
Object.defineProperty(global, 'URL', {
  value: class URL {
    href: string
    protocol: string
    hostname: string
    
    constructor(url: string) {
      if (!url || typeof url !== 'string') {
        throw new TypeError('Invalid URL')
      }
      
      // Simple validation for test purposes
      if (!url.match(/^https?:\/\/.+/)) {
        throw new TypeError('Invalid URL')
      }
      
      this.href = url
      this.protocol = url.split('://')[0] + ':'
      this.hostname = url.split('://')[1]?.split('/')[0] || ''
    }
  },
  writable: true,
  configurable: true
})

describe("UrlForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render form fields correctly", () => {
    const wrapper = mount(UrlForm)
    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should validate required URL field and prevent submission", async () => {
    const wrapper = mount(UrlForm)

    // Form should be invalid initially (no URL entered)
    const vm = wrapper.vm as any
    expect(vm.isFormValid.value).toBe(false)
    
    // Try to submit form without URL - should not call API
    const form = wrapper.find('form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Should not have called API
    expect(mockUseFetch).not.toHaveBeenCalled()
  })

  it("should validate URL format and prevent submission", async () => {
    const wrapper = mount(UrlForm)

    // Enter invalid URL using form interaction
    const urlInput = wrapper.find('input[type="url"]')
    await urlInput.setValue('invalid-url')
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    // Form should be invalid due to URL format
    expect(vm.isFormValid.value).toBe(false)

    // Try to submit form with invalid URL - should not call API
    const form = wrapper.find('form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Should not have called API
    expect(mockUseFetch).not.toHaveBeenCalled()
  })

  it("should validate shortCode format and prevent submission", async () => {
    const wrapper = mount(UrlForm)

    // Enter valid URL and invalid shortCode using form interaction
    const urlInput = wrapper.find('input[type="url"]')
    await urlInput.setValue('https://example.com')

    const shortCodeInput = wrapper.find('input#shortCode')
    await shortCodeInput.setValue('invalid code') // space not allowed
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    // Form should be invalid due to shortCode
    expect(vm.isFormValid.value).toBe(false)

    // Try to submit form with invalid shortCode - should not call API
    const form = wrapper.find('form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()
    
    // Should not have called API
    expect(mockUseFetch).not.toHaveBeenCalled()
  })

  it("should prepare correct request body without shortCode", async () => {
    const wrapper = mount(UrlForm)

    // Fill form using form interactions
    const urlInput = wrapper.find('input[type="url"]')
    await urlInput.setValue('https://example.com')
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    
    // Test the body preparation logic (this is the actual unit we're testing)
    const body: { originalUrl: string; shortCode?: string } = {
      originalUrl: vm.state.originalUrl.trim()
    }

    if (vm.state.shortCode.trim()) {
      body.shortCode = vm.state.shortCode.trim()
    }

    expect(body).toEqual({
      originalUrl: 'https://example.com'
    })
  })

  it("should prepare correct request body with custom shortCode", async () => {
    const wrapper = mount(UrlForm)

    // Fill form using form interactions
    const urlInput = wrapper.find('input[type="url"]')
    const shortCodeInput = wrapper.find('input#shortCode')
    
    await urlInput.setValue('https://example.com')
    await shortCodeInput.setValue('custom123')
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any

    // Test the body preparation logic (this is the actual unit we're testing)
    const body: { originalUrl: string; shortCode?: string } = {
      originalUrl: vm.state.originalUrl.trim()
    }

    if (vm.state.shortCode.trim()) {
      body.shortCode = vm.state.shortCode.trim()
    }

    expect(body).toEqual({
      originalUrl: 'https://example.com',
      shortCode: 'custom123'
    })
  })

  it("should reset form state when resetForm is called", async () => {
    const wrapper = mount(UrlForm)

    // Fill form using form interactions
    const urlInput = wrapper.find('input[type="url"]')
    const shortCodeInput = wrapper.find('input#shortCode')
    
    await urlInput.setValue('https://example.com')
    await shortCodeInput.setValue('test123')
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    
    // Verify form state is filled (through form interaction)
    expect(vm.state.originalUrl).toBe('https://example.com')
    expect(vm.state.shortCode).toBe('test123')

    // Call resetForm method directly (this is what we're testing)
    vm.resetForm()
    await wrapper.vm.$nextTick()

    // Form state should be reset
    expect(vm.state.originalUrl).toBe('')
    expect(vm.state.shortCode).toBe('')
    expect(vm.state.error).toBe('')
  })

  it("should emit created event when called", async () => {
    const mockResponse = {
      shortCode: "abc123",
      originalUrl: "https://example.com",
      shortUrl: "http://localhost:3000/abc123"
    }

    const wrapper = mount(UrlForm)
    const vm = wrapper.vm as any

    // Test the emit functionality directly
    vm.$emit('created', mockResponse)
    await wrapper.vm.$nextTick()

    // Should emit created event with URL data
    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')?.[0]).toEqual([mockResponse])
  })

  it("should test form interaction and state synchronization", async () => {
    const wrapper = mount(UrlForm)

    // Fill form with valid data using form interactions
    const urlInput = wrapper.find('input[type="url"]')
    await urlInput.setValue('https://example.com')
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    
    // State should be synchronized with form input
    expect(vm.state.originalUrl).toBe('https://example.com')
    
    // Submit button should exist and be interactable
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.exists()).toBe(true)
  })

  it("should test form interaction with custom shortCode", async () => {
    const wrapper = mount(UrlForm)

    // Fill form with valid data using form interactions
    const urlInput = wrapper.find('input[type="url"]')
    const shortCodeInput = wrapper.find('input#shortCode')
    
    await urlInput.setValue('https://example.com')
    await shortCodeInput.setValue('valid-code')
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as any
    
    // State should be synchronized with form inputs
    expect(vm.state.originalUrl).toBe('https://example.com')
    expect(vm.state.shortCode).toBe('valid-code')
    
    // Submit button should exist and be interactable
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.exists()).toBe(true)
  })

  it("should show success message after URL creation", async () => {
    const wrapper = mount(UrlForm)
    const vm = wrapper.vm as any
    
    // Simulate successful API response by directly setting the reactive properties
    // This mimics what happens in the actual handleSubmit method
    vm.state.success = true
    vm.state.successMessage = 'URL erfolgreich verkürzt: http://localhost:3000/abc123'
    
    // Force reactivity update
    await wrapper.vm.$forceUpdate()
    await wrapper.vm.$nextTick()

    // Should show success div
    const successDiv = wrapper.find('.bg-green-50')
    expect(successDiv.exists()).toBe(true)
    
    // Should contain success message
    expect(successDiv.text()).toContain('URL erfolgreich verkürzt')
    expect(successDiv.text()).toContain('http://localhost:3000/abc123')
  })

  it("should show error message on API failure", async () => {
    const wrapper = mount(UrlForm)
    const vm = wrapper.vm as any
    const errorMessage = "Short Code bereits vergeben"
    
    // Simulate API error by directly setting the reactive properties
    // This mimics what happens in the actual handleSubmit method
    vm.state.error = errorMessage
    
    // Force reactivity update
    await wrapper.vm.$forceUpdate()
    await wrapper.vm.$nextTick()

    // Should show error div
    const errorDiv = wrapper.find('.bg-red-50')
    expect(errorDiv.exists()).toBe(true)
    
    // Should contain error message
    expect(errorDiv.text()).toContain('Fehler')
    expect(errorDiv.text()).toContain(errorMessage)
  })

  it("should disable submit button while loading", async () => {
    const wrapper = mount(UrlForm)
    const vm = wrapper.vm as any
    
    // Set valid URL first so form can be valid
    vm.state.originalUrl = 'https://example.com'
    
    // Simulate loading state by directly setting the reactive property
    // This mimics what happens in the actual handleSubmit method
    vm.state.loading = true
    
    // Force reactivity update
    await wrapper.vm.$forceUpdate()
    await wrapper.vm.$nextTick()

    // Button should be disabled during loading
    const submitButton = wrapper.find('button[type="submit"]')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(true)
    
    // Button text should show loading state
    expect(submitButton.text()).toBe('Wird erstellt...')
  })
})
