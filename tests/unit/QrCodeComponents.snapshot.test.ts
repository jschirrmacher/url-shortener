/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import QrCodeDisplay from "~/components/QrCodeDisplay.vue"
import QrCodeModal from "~/components/QrCodeModal.vue"

describe("QR Code Components Snapshots", () => {
  describe("QrCodeDisplay", () => {
    it("should render with default props", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "abc123",
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with custom size", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "abc123",
          size: 300,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render without download buttons", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "abc123",
          showDownload: false,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with all props", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "test123",
          size: 250,
          showDownload: true,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe("QrCodeModal", () => {
    const defaultProps = {
      shortCode: "abc123",
      shortUrl: "https://example.com/abc123",
      originalUrl: "https://target.com",
      isOpen: true,
    }

    it("should render when open", () => {
      const wrapper = mount(QrCodeModal, {
        props: defaultProps,
        global: {
          stubs: {
            QrCodeDisplay: {
              template: '<div class="qr-display-stub">QR Display</div>',
            },
          },
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should not render when closed", () => {
      const wrapper = mount(QrCodeModal, {
        props: {
          ...defaultProps,
          isOpen: false,
        },
        global: {
          stubs: {
            QrCodeDisplay: {
              template: '<div class="qr-display-stub">QR Display</div>',
            },
          },
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with long URLs", () => {
      const wrapper = mount(QrCodeModal, {
        props: {
          ...defaultProps,
          shortUrl: "https://very-long-domain-name.example.com/very/long/path/abc123",
          originalUrl:
            "https://another-very-long-domain-name.example.com/with/many/path/segments/and/parameters?param1=value1&param2=value2",
        },
        global: {
          stubs: {
            QrCodeDisplay: {
              template: '<div class="qr-display-stub">QR Display</div>',
            },
          },
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should render with special characters in URLs", () => {
      const wrapper = mount(QrCodeModal, {
        props: {
          ...defaultProps,
          shortUrl: "https://example.com/special123",
          originalUrl: "https://target.com/path?param=value&other=test#section",
        },
        global: {
          stubs: {
            QrCodeDisplay: {
              template: '<div class="qr-display-stub">QR Display</div>',
            },
          },
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe("Component Structure", () => {
    it("should maintain consistent QrCodeDisplay structure", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "structure",
        },
      })

      // Test key structural elements
      expect(wrapper.find(".qr-code-container").exists()).toBe(true)
      expect(wrapper.find(".qr-code-wrapper").exists()).toBe(true)
      expect(wrapper.text()).toContain("QR-Code für: structure")
    })

    it("should maintain consistent QrCodeModal structure", () => {
      const wrapper = mount(QrCodeModal, {
        props: {
          shortCode: "modal123",
          shortUrl: "https://example.com/modal123",
          originalUrl: "https://target.com",
          isOpen: true,
        },
        global: {
          stubs: {
            QrCodeDisplay: {
              template: '<div class="qr-display-stub">QR Display</div>',
            },
          },
        },
      })

      // Test key structural elements
      expect(wrapper.find(".fixed.inset-0").exists()).toBe(true)
      expect(wrapper.find(".bg-white.rounded-lg").exists()).toBe(true)
      expect(wrapper.find("select").exists()).toBe(true)
      expect(wrapper.text()).toContain("QR-Code für Kurzlink")
      expect(wrapper.text()).toContain("modal123")
    })
  })

  describe("Props Validation", () => {
    it("should handle empty shortCode gracefully", () => {
      const wrapper = mount(QrCodeDisplay, {
        props: {
          shortCode: "",
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should handle minimal modal props", () => {
      const wrapper = mount(QrCodeModal, {
        props: {
          shortCode: "",
          shortUrl: "",
          originalUrl: "",
          isOpen: true,
        },
        global: {
          stubs: {
            QrCodeDisplay: {
              template: '<div class="qr-display-stub">QR Display</div>',
            },
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
