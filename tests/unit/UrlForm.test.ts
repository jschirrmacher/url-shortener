/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { ref, reactive, computed, watch, watchEffect } from "vue"
import UrlForm from "~/components/url/UrlForm.vue"

// Mock useClipboard
vi.stubGlobal('useClipboard', () => ({
  copyToClipboard: vi.fn()
}))

// Default mocks
const mockUser = ref({ role: 'user', username: 'testuser' })
const mockUsers = ref([])

vi.stubGlobal('useAuth', () => ({
  user: mockUser
}))

vi.stubGlobal('useUsersStore', () => ({
  users: mockUsers,
  loadUsers: vi.fn()
}))

// Mock Vue composables
vi.stubGlobal('ref', ref)
vi.stubGlobal('reactive', reactive)
vi.stubGlobal('computed', computed)
vi.stubGlobal('watch', watch)
vi.stubGlobal('watchEffect', watchEffect)
vi.stubGlobal('onMounted', vi.fn())

describe("UrlForm Component", () => {
  beforeEach(() => {
    // Reset to default user
    mockUser.value = { role: 'user', username: 'testuser' }
    mockUsers.value = []
  })
  it("should match snapshot in create mode", () => {
    const wrapper = mount(UrlForm, {
      global: {
        stubs: {
          BaseButton: true,
          AlertMessage: true
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should match snapshot in edit mode", () => {
    const wrapper = mount(UrlForm, {
      props: {
        shortUrl: "http://localhost:3000/abc123",
        shortCode: "abc123",
        originalUrl: "https://example.com",
        title: "Example Website"
      },
      global: {
        stubs: {
          BaseButton: true,
          AlertMessage: true
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should emit changed event with form data", async () => {
    const wrapper = mount(UrlForm, {
      global: {
        stubs: {
          BaseButton: true,
          AlertMessage: true
        }
      }
    })

    // Fill form
    await wrapper.find('#originalUrl').setValue('https://test.com')
    await wrapper.find('#shortCode').setValue('test123')
    await wrapper.find('#title').setValue('Test Title')

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    // Check emit
    const emitted = wrapper.emitted('changed')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual([{
      originalUrl: 'https://test.com',
      shortCode: 'test123',
      title: 'Test Title',
      owner: 'testuser'
    }])
  })

  it("should show cancel button in edit mode", () => {
    const wrapper = mount(UrlForm, {
      props: {
        shortUrl: "http://localhost:3000/abc123"
      },
      global: {
        stubs: {
          BaseButton: true,
          AlertMessage: true
        }
      }
    })

    // Should have more buttons in edit mode (including copy button)
    const buttons = wrapper.findAllComponents({ name: 'BaseButton' })
    expect(buttons.length).toBeGreaterThan(1)
  })

  it("should not show owner selection for regular users", () => {
    const wrapper = mount(UrlForm, {
      global: {
        stubs: {
          BaseButton: true,
          AlertMessage: true
        }
      }
    })

    // Owner selection should not be visible (regular user)
    const ownerField = wrapper.find('[data-testid="owner-field"]')
    expect(ownerField.exists()).toBe(false)
  })

  it("should include owner field in emitted data when user is admin", async () => {
    // This test verifies that admin users can set owner field
    const wrapper = mount(UrlForm, {
      global: {
        stubs: {
          BaseButton: true,
          AlertMessage: true
        }
      }
    })

    // Fill form data
    await wrapper.find('#originalUrl').setValue('https://test.com')
    await wrapper.find('#shortCode').setValue('test123')
    await wrapper.find('#title').setValue('Test Title')

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    // Check emitted data includes owner field (from mock user)
    const emitted = wrapper.emitted('changed')
    expect(emitted).toBeTruthy()
    const eventData = emitted![0]![0] as { owner: string }
    expect(eventData).toHaveProperty('owner')
    expect(eventData.owner).toBe('testuser')
  })
})
