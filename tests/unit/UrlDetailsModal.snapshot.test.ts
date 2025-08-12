/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import UrlDetailsModal from "~/components/url/UrlDetailsModal.vue"

describe("URL Components Snapshots", () => {
  describe("UrlDetailsModal", () => {
    beforeEach(() => {
      // Mock global functions
      global.$fetch = vi.fn().mockResolvedValue({
        success: true,
      }) as any
    })

    const defaultProps = {
      shortCode: "abc123",
      shortUrl: "http://localhost:3000/abc123",
      originalUrl: "https://example.com",
      isOpen: false,
    }

    it("should render when closed", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: defaultProps,
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render when open", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          ...defaultProps,
          isOpen: true,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with long URLs", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          ...defaultProps,
          shortUrl: "http://localhost:3000/long123",
          originalUrl: "https://very-long-example-url-that-should-be-displayed-properly.com/with/many/path/segments",
          isOpen: true,
        },
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
          isOpen: true,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with different shortCode formats", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          ...defaultProps,
          shortCode: "ABC-123_test",
          shortUrl: "http://localhost:3000/ABC-123_test",
          isOpen: true,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with minimal props", () => {
      const wrapper = mount(UrlDetailsModal, {
        props: {
          shortCode: "min",
          shortUrl: "http://localhost:3000/min",
          originalUrl: "https://a.co",
          isOpen: true,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
