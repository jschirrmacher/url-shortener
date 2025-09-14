import { describe, it, expect } from "vitest"

describe("URL Service - Update Logic", () => {
  describe("ShortCode Validation", () => {
    it("should validate shortCode patterns correctly", () => {
      const isValidShortCode = (code: string) => {
        return /^[a-zA-Z0-9-_]+$/.test(code)
      }

      // Valid codes
      const validCodes = ["abc123", "ABC123", "test-code", "test_code", "a1-b2_c3"]
      validCodes.forEach(code => {
        expect(isValidShortCode(code)).toBe(true)
      })

      // Invalid codes
      const invalidCodes = ["test code", "test.code", "test@code", "test/code", ""]
      invalidCodes.forEach(code => {
        expect(isValidShortCode(code)).toBe(false)
      })
    })
  })

  describe("URL Validation", () => {
    it("should validate URLs correctly", () => {
      const isValidUrl = (url: string) => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      }

      // Valid URLs
      expect(isValidUrl("https://example.com")).toBe(true)
      expect(isValidUrl("http://example.com")).toBe(true)
      expect(isValidUrl("https://example.com/path?param=value")).toBe(true)

      // Invalid URLs
      expect(isValidUrl("invalid-url")).toBe(false)
      expect(isValidUrl("example.com")).toBe(false)
      expect(isValidUrl("")).toBe(false)
    })
  })

  describe("Update Logic", () => {
    it("should determine when to send newShortCode", () => {
      const shouldSendNewShortCode = (original: string, new_: string) => {
        return !!(new_ && new_ !== original)
      }

      expect(shouldSendNewShortCode("abc123", "new123")).toBe(true)
      expect(shouldSendNewShortCode("abc123", "abc123")).toBe(false)
      expect(shouldSendNewShortCode("abc123", "")).toBe(false)
    })

    it("should build correct API request body", () => {
      const buildRequestBody = (originalUrl: string, newShortCode?: string, currentShortCode?: string) => {
        const body: any = { originalUrl }
        if (newShortCode && newShortCode !== currentShortCode) {
          body.newShortCode = newShortCode
        }
        return body
      }

      // With shortCode change
      expect(buildRequestBody("https://example.com", "new123", "abc123")).toEqual({
        originalUrl: "https://example.com",
        newShortCode: "new123"
      })

      // Without shortCode change
      expect(buildRequestBody("https://example.com", "abc123", "abc123")).toEqual({
        originalUrl: "https://example.com"
      })

      // No new shortCode provided
      expect(buildRequestBody("https://example.com", undefined, "abc123")).toEqual({
        originalUrl: "https://example.com"
      })
    })
  })

  describe("Data Update Logic", () => {
    it("should update shortCode in data structures", () => {
      const updateShortCodeInArray = (items: any[], oldCode: string, newCode: string) => {
        return items.map(item => {
          if (item.shortCode === oldCode) {
            return { ...item, shortCode: newCode }
          }
          return item
        })
      }

      const testData = [
        { shortCode: "abc123", url: "https://example.com" },
        { shortCode: "def456", url: "https://another.com" },
        { shortCode: "abc123", url: "https://duplicate.com" }
      ]

      const updated = updateShortCodeInArray(testData, "abc123", "new123")

      expect(updated).toEqual([
        { shortCode: "new123", url: "https://example.com" },
        { shortCode: "def456", url: "https://another.com" },
        { shortCode: "new123", url: "https://duplicate.com" }
      ])
    })

    it("should handle empty arrays", () => {
      const updateShortCodeInArray = (items: any[], oldCode: string, newCode: string) => {
        return items.map(item => {
          if (item.shortCode === oldCode) {
            return { ...item, shortCode: newCode }
          }
          return item
        })
      }

      const result = updateShortCodeInArray([], "abc123", "new123")
      expect(result).toEqual([])
    })

    it("should handle non-matching shortCodes", () => {
      const updateShortCodeInArray = (items: any[], oldCode: string, newCode: string) => {
        return items.map(item => {
          if (item.shortCode === oldCode) {
            return { ...item, shortCode: newCode }
          }
          return item
        })
      }

      const testData = [
        { shortCode: "def456", url: "https://example.com" }
      ]

      const updated = updateShortCodeInArray(testData, "abc123", "new123")
      expect(updated).toEqual(testData) // unchanged
    })
  })

  describe("Error Handling", () => {
    it("should identify different error types", () => {
      const getErrorType = (shortCode: string, urls: any[]) => {
        if (!shortCode) return "MISSING_SHORTCODE"
        if (!/^[a-zA-Z0-9-_]+$/.test(shortCode)) return "INVALID_FORMAT"
        if (urls.some(url => url.shortCode === shortCode)) return "DUPLICATE"
        return "VALID"
      }

      const existingUrls = [{ shortCode: "existing123" }]

      expect(getErrorType("", existingUrls)).toBe("MISSING_SHORTCODE")
      expect(getErrorType("invalid code", existingUrls)).toBe("INVALID_FORMAT")
      expect(getErrorType("existing123", existingUrls)).toBe("DUPLICATE")
      expect(getErrorType("new123", existingUrls)).toBe("VALID")
    })
  })
})
