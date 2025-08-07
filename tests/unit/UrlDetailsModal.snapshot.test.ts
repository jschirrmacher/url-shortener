/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import QrCodeDisplay from "~/components/QrCodeDisplay.vue"
import UrlDetailsModal from "~/components/url/UrlDetailsModal.vue"

describe("URL Components Snapshots", () => {
  describe("QrCodeDisplay", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "abc123",
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders correctly with custom size", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "abc123",
          size: 300,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders correctly with custom alt text", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "abc123",
          alt: "Custom QR Code Alt Text",
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders correctly with all custom props", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "custom123",
          size: 250,
          alt: "Custom Alt Text",
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders correctly with very long shortCode", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "very-long-short-code-that-might-affect-rendering",
          size: 200,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders correctly with minimal size", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "min123",
          size: 100,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders correctly with large size", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "large123",
          size: 500,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe("UrlDetailsModal", () => {
    beforeEach(() => {
      // Mock global functions
      global.$fetch = vi.fn().mockResolvedValue({
        success: true
      }) as any
    })

    const defaultProps = {
      shortCode: "abc123",
      shortUrl: "http://localhost:3000/abc123",
      originalUrl: "https://example.com",
      isOpen: false
    }

    it("should render when closed", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: defaultProps
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render when open", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          ...defaultProps,
          isOpen: true
        }
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with long URLs", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          ...defaultProps,
          shortUrl: "http://localhost:3000/long123",
          originalUrl: "https://very-long-example-url-that-should-be-displayed-properly.com/with/many/path/segments",
          isOpen: true
        }
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with special characters in URLs", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          ...defaultProps,
          shortCode: "special123",
          shortUrl: "http://localhost:3000/special123",
          originalUrl: "https://example.com/path?param=value&other=test#section",
          isOpen: true
        }
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with different shortCode formats", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          ...defaultProps,
          shortCode: "ABC-123_test",
          shortUrl: "http://localhost:3000/ABC-123_test",
          isOpen: true
        }
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with minimal props", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          shortCode: "min",
          shortUrl: "http://localhost:3000/min",
          originalUrl: "https://a.co",
          isOpen: true
        }
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
