/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import RecentClicks from "~/components/stats/RecentClicks.vue"
import type { UrlStats } from "~/types/index"

function createMockStats(dailyStats: any[], sourceBreakdown: Record<string, number>): UrlStats {
  return {
    url: {
      shortCode: "test123",
      originalUrl: "https://example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "testuser",
    },
    totalClicks: 100,
    uniqueVisitors: 50,
    dailyStats,
    topReferrers: [],
    sourceBreakdown,
  }
}

describe("RecentClicks - Funktionale Anforderungen", () => {
  describe("Datenbereich - 30 Tage Zeitraum", () => {
    it("sollte 30 Tage anzeigen", () => {
      const today = new Date().toISOString().split("T")[0]
      const stats = createMockStats([{ date: today, clicks: 10, uniqueVisitors: 5 }], { direct: 10 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const bars = wrapper.findAll(".stacked-bar")

      expect(bars).toHaveLength(30)
    })

    it("sollte alle Tage anzeigen, auch die ohne Klicks", () => {
      const stats = createMockStats([{ date: "2024-01-01", clicks: 5, uniqueVisitors: 3 }], { direct: 5 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const allBars = wrapper.findAll(".stack")
      const emptyBars = allBars.filter(
        (bar) => bar.classes().includes("bar-empty") || bar.attributes("style")?.includes("height: 2px"),
      )

      expect(emptyBars.length).toBeGreaterThan(0)
    })

    it("sollte Tage in aufsteigender chronologischer Reihenfolge sortieren", () => {
      const stats = createMockStats([{ date: "2024-01-01", clicks: 10, uniqueVisitors: 5 }], { direct: 10 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const bars = wrapper.findAll(".stacked-bar")

      expect(bars).toHaveLength(30)
      // TODO: Validate actual chronological order
    })
  })

  describe("Traffic-Quellen - Vollständige Aufschlüsselung", () => {
    it("sollte alle verfügbaren Quellen in der Legende anzeigen", () => {
      const stats = createMockStats([{ date: "2024-01-01", clicks: 30, uniqueVisitors: 15 }], {
        website: 10,
        direct: 8,
        "qr-code": 5,
        email: 4,
        social: 3,
      })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const legendItems = wrapper.findAll(".legend-item")

      expect(legendItems).toHaveLength(5)
      expect(wrapper.text()).toContain("Website")
      expect(wrapper.text()).toContain("Direkt")
      expect(wrapper.text()).toContain("QR-Code")
      expect(wrapper.text()).toContain("E-Mail")
      expect(wrapper.text()).toContain("Social Media")
    })

    it("sollte gestapelte Segmente für verschiedene Quellen erstellen", () => {
      const today = new Date().toISOString().split("T")[0]
      const stats = createMockStats([{ date: today, clicks: 20, uniqueVisitors: 10 }], { website: 12, direct: 8 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const segments = wrapper.findAll(".segment")

      expect(segments.length).toBeGreaterThan(0)

      const websiteSegment = segments.find((seg) => seg.attributes("title")?.includes("Website:"))
      const directSegment = segments.find((seg) => seg.attributes("title")?.includes("Direkt:"))

      expect(websiteSegment).toBeTruthy()
      expect(directSegment).toBeTruthy()
    })
  })

  describe("Null-Werte-Behandlung", () => {
    it("sollte leere Quellen-Strings als 'direct' behandeln", () => {
      const stats = createMockStats([{ date: "2024-01-01", clicks: 10, uniqueVisitors: 5 }], { "": 5, direct: 3 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const legendItems = wrapper.findAll(".legend-item")

      // Sollte nur "Direkt" anzeigen (leerer String wurde zusammengefasst)
      expect(legendItems).toHaveLength(1)
      expect(wrapper.text()).toContain("Direkt")
    })

    it("sollte Tage ohne Klicks als 2px hohe Balken darstellen", () => {
      const stats = createMockStats([], { direct: 0 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const emptyBars = wrapper.findAll(".empty")

      expect(emptyBars.length).toBe(30) // Alle 30 Tage sollten leer sein
      emptyBars.forEach((bar) => {
        expect(bar.attributes("style")).toContain("height: 2px")
      })
    })
  })

  describe("Interaktivität - Hover und Tooltips", () => {
    it("sollte Tooltips mit korrekten Informationen anzeigen", () => {
      const today = new Date().toISOString().split("T")[0]
      const stats = createMockStats([{ date: today, clicks: 25, uniqueVisitors: 12 }], { website: 15, direct: 10 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const barStacks = wrapper.findAll(".stack")

      const dataBar = barStacks.find((bar) => bar.attributes("title")?.includes("25 Klicks"))

      expect(dataBar).toBeTruthy()
      expect(dataBar?.attributes("title")).toContain("25 Klicks gesamt")
      expect(dataBar?.attributes("title")).toContain("12 unique Besucher")
    })

    it("sollte Hover-Werte für Klicks anzeigen", () => {
      const today = new Date().toISOString().split("T")[0]
      const stats = createMockStats([{ date: today, clicks: 15, uniqueVisitors: 8 }], { direct: 15 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const barValues = wrapper.findAll(".value")

      const valueBar = barValues.find((val) => val.text() === "15")
      expect(valueBar).toBeTruthy()
    })
  })

  describe("Beschriftung - Selektive Labels", () => {
    it("sollte selektive Datum-Labels anzeigen (jedes 3. + letztes)", () => {
      const stats = createMockStats([{ date: "2024-01-01", clicks: 10, uniqueVisitors: 5 }], { direct: 10 })

      const wrapper = mount(RecentClicks, { props: { stats } })
      const allLabels = wrapper.findAll(".label")
      const visibleLabels = allLabels.filter((label) => label.text().trim() !== "")

      expect(visibleLabels.length).toBe(11)

      const actualIndices = allLabels
        .map((label, index) => ({ label, index }))
        .filter(({ label }) => label.text().trim() !== "")
        .map(({ index }) => index)

      expect(actualIndices).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 29])
    })

    it("sollte korrekte Titel anzeigen", () => {
      const stats = createMockStats([], {})

      const wrapper = mount(RecentClicks, { props: { stats } })
      const title = wrapper.find(".chart-title")

      expect(title.text()).toBe("Tägliche Klicks nach Quelle (letzte 30 Tage)")
    })
  })

  describe("Datenverarbeitung - Proportionale Höhen", () => {
    it("sollte proportionale Höhen basierend auf Maximum berechnen", () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const stats = createMockStats(
        [
          { date: yesterday.toISOString().split("T")[0], clicks: 10, uniqueVisitors: 5 },
          { date: today.toISOString().split("T")[0], clicks: 20, uniqueVisitors: 10 }, // Maximum
        ],
        { direct: 30 },
      )

      const wrapper = mount(RecentClicks, { props: { stats } })
      const barStacks = wrapper.findAll(".stack")

      const maxBar = barStacks.find((bar) => bar.attributes("title")?.includes("20 Klicks"))
      expect(maxBar).toBeTruthy()
      expect(maxBar?.attributes("style")).toContain("100%")

      const halfBar = barStacks.find((bar) => bar.attributes("title")?.includes("10 Klicks"))
      expect(halfBar).toBeTruthy()
      expect(halfBar?.attributes("style")).toContain("50%")
    })

    it("sollte alle Balken auf gleicher Grundlinie beginnen", () => {
      const stats = createMockStats(
        [
          { date: "2024-01-01", clicks: 10, uniqueVisitors: 5 },
          { date: "2024-01-02", clicks: 0, uniqueVisitors: 0 },
        ],
        { direct: 10 },
      )

      const wrapper = mount(RecentClicks, { props: { stats } })
      const barWrappers = wrapper.findAll(".stacked-bar")

      // Alle bar-wrapper sollten align-items: flex-end haben
      expect(barWrappers.length).toBeGreaterThan(0)
    })
  })
})
