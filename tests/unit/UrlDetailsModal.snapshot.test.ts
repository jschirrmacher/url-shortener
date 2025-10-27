import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import UrlDetailsModal from "~/components/url/UrlDetailsModal.vue"

// Mock $fetch
vi.stubGlobal("$fetch", vi.fn())

// Mock fetch for QR code
global.fetch = vi.fn()

describe("URL Components Snapshots", () => {
  describe("UrlDetailsModal", () => {
    const baseData = {
      shortCode: "abc123",
      shortUrl: "http://localhost:3000/abc123",
      originalUrl: "https://example.com",
      title: "Example Website",
      currentOwner: "testuser",
      isOpen: false
    }

    it("should render when closed", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          data: { ...baseData, isOpen: false }
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

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render when open", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          data: { ...baseData, isOpen: true }
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

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with long URLs", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          data: {
            ...baseData,
            shortCode: "long123",
            shortUrl: "http://localhost:3000/long123",
            originalUrl: "https://very-long-example-url-that-should-be-displayed-properly.com/with/many/path/segments",
            isOpen: false
          }
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

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with special characters in URLs", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          data: {
            ...baseData,
            shortCode: "special123",
            shortUrl: "http://localhost:3000/special123",
            originalUrl: "https://example.com/path?param=value&other=test#section",
            isOpen: false
          }
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

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with different shortCode formats", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          data: {
            ...baseData,
            shortCode: "ABC-123_test",
            shortUrl: "http://localhost:3000/ABC-123_test",
            isOpen: false
          }
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

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with minimal props", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          data: {
            shortCode: "min",
            shortUrl: "http://localhost:3000/min",
            originalUrl: "https://a.co",
            title: "",
            currentOwner: "user",
            isOpen: false
          }
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

      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
