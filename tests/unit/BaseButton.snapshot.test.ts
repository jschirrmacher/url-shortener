/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import BaseButton from "~/components/ui/BaseButton.vue"

describe("BaseButton", () => {
  describe("Variants", () => {
    it("renders primary variant correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "primary" },
        slots: { default: "Primary Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders secondary variant correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "secondary" },
        slots: { default: "Secondary Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders success variant correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "success" },
        slots: { default: "Success Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders danger variant correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "danger" },
        slots: { default: "Danger Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders ghost variant correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { variant: "ghost" },
        slots: { default: "Ghost Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe("Sizes", () => {
    it("renders small size correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { size: "sm" },
        slots: { default: "Small Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders medium size correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { size: "md" },
        slots: { default: "Medium Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders large size correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { size: "lg" },
        slots: { default: "Large Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe("States", () => {
    it("renders disabled state correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: "Disabled Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders loading state correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: "Loading Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders full width correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { fullWidth: true },
        slots: { default: "Full Width Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe("Button Types", () => {
    it("renders submit type correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { type: "submit" },
        slots: { default: "Submit Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders reset type correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { type: "reset" },
        slots: { default: "Reset Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe("Interactions", () => {
    it("does not emit click event when disabled", async () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: "Disabled" }
      })

      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it("does not emit click event when loading", async () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: "Loading" }
      })

      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe("Complex combinations", () => {
    it("renders primary large full-width button correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { 
          variant: "primary", 
          size: "lg", 
          fullWidth: true 
        },
        slots: { default: "Complex Button" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("renders danger small loading button correctly", () => {
      const wrapper = mount(BaseButton, {
        props: { 
          variant: "danger", 
          size: "sm", 
          loading: true 
        },
        slots: { default: "Delete" }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
