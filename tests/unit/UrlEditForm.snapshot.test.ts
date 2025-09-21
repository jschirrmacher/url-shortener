import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { ref } from "vue"
import UrlEditForm from "~/components/url/UrlEditForm.vue"

// Mock useClipboard
vi.stubGlobal('useClipboard', () => ({
  copyToClipboard: vi.fn()
}))

// Mock Vue ref
vi.stubGlobal('ref', ref)

describe("UrlEditForm Snapshots", () => {
  const mockProps = {
    shortUrl: "http://localhost:3000/abc123",
    shortCode: "abc123",
    originalUrl: "https://example.com",
    title: "Example Website",
    loading: false
  }

  it("should match snapshot with all props", () => {
    const wrapper = mount(UrlEditForm, {
      props: mockProps,
      global: {
        stubs: {
          BaseButton: true
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
