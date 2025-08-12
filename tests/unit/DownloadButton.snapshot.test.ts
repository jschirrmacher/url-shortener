/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import DownloadButton from "~/components/ui/DownloadButton.vue"

describe("DownloadButton", () => {
  it("renders PNG button correctly", () => {
    const wrapper = mount(DownloadButton, {
      props: {
        format: "png",
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("renders SVG button correctly", () => {
    const wrapper = mount(DownloadButton, {
      props: {
        format: "svg",
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("renders disabled PNG button correctly", () => {
    const wrapper = mount(DownloadButton, {
      props: {
        format: "png",
        disabled: true,
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("renders disabled SVG button correctly", () => {
    const wrapper = mount(DownloadButton, {
      props: {
        format: "svg",
        disabled: true,
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it("displays correct format label for PNG", () => {
    const wrapper = mount(DownloadButton, {
      props: {
        format: "png",
      },
    })

    expect(wrapper.text()).toContain("PNG")
  })

  it("displays correct format label for SVG", () => {
    const wrapper = mount(DownloadButton, {
      props: {
        format: "svg",
      },
    })

    expect(wrapper.text()).toContain("SVG")
  })
})
