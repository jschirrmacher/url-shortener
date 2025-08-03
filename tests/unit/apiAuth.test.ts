import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import type { H3Event } from "h3"
import type { User, AuthUser } from "~/types/index"
import {
  authenticateRequest,
  requireAdmin,
  requireOwnershipOrAdmin,
  getClientIP,
  getUserAgent,
  getReferrer,
  setAuthCookie,
  clearAuthCookie,
  validateRequestBody,
  validateUrl,
  sanitizeForCsv,
  checkRateLimit,
  clearRateLimit,
} from "~/utils/apiAuth"

// Import mocked functions
import { getCookie, setCookie, deleteCookie, getHeader, createError } from "h3"
import useUsers from "~/server/useUsers"

// Mock dependencies
vi.mock("~/server/useUsers")
vi.mock("h3", () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  getHeader: vi.fn(),
  createError: vi.fn((options) => new Error(options.message)),
}))

const mockGetCookie = vi.mocked(getCookie)
const mockSetCookie = vi.mocked(setCookie)
const mockDeleteCookie = vi.mocked(deleteCookie)
const mockGetHeader = vi.mocked(getHeader)
const mockCreateError = vi.mocked(createError)
const mockUseUsers = vi.mocked(useUsers)

describe("apiAuth", () => {
  let mockEvent: H3Event
  let mockUsers: {
    verifyToken: ReturnType<typeof vi.fn>
    getUser: ReturnType<typeof vi.fn>
    createUser: ReturnType<typeof vi.fn>
    authenticateUser: ReturnType<typeof vi.fn>
    getAllUsers: ReturnType<typeof vi.fn>
    changePassword: ReturnType<typeof vi.fn>
    updateUserRole: ReturnType<typeof vi.fn>
    deleteUser: ReturnType<typeof vi.fn>
    deactivateUser: ReturnType<typeof vi.fn>
    reactivateUser: ReturnType<typeof vi.fn>
  }

  const mockUser: User = {
    username: "testuser",
    role: "user",
    createdAt: "2024-01-01T00:00:00.000Z",
    active: true,
  }

  const mockAdminUser: User = {
    username: "admin",
    role: "admin",
    createdAt: "2024-01-01T00:00:00.000Z",
    active: true,
  }

  const mockAuthUser: AuthUser = {
    username: "testuser",
    userId: "user123",
    iat: 1640995200,
    exp: 1641081600,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock H3Event
    mockEvent = {
      node: {
        req: {
          socket: {
            remoteAddress: "192.168.1.1",
          },
        },
      },
    } as any

    // Mock users service
    mockUsers = {
      verifyToken: vi.fn(),
      getUser: vi.fn(),
      createUser: vi.fn(),
      authenticateUser: vi.fn(),
      getAllUsers: vi.fn(),
      changePassword: vi.fn(),
      updateUserRole: vi.fn(),
      deleteUser: vi.fn(),
      deactivateUser: vi.fn(),
      reactivateUser: vi.fn(),
    }
    mockUseUsers.mockReturnValue(mockUsers)

    // Reset process.env
    process.env.NODE_ENV = "development"
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("authenticateRequest", () => {
    it("should authenticate user with valid token", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue(mockAuthUser)
      mockUsers.getUser.mockResolvedValue(mockUser)

      const result = await authenticateRequest(mockEvent)

      expect(mockGetCookie).toHaveBeenCalledWith(mockEvent, "auth-token")
      expect(mockUsers.verifyToken).toHaveBeenCalledWith(token)
      expect(mockUsers.getUser).toHaveBeenCalledWith(mockAuthUser.username)
      expect(result).toEqual({
        user: mockUser,
        isAdmin: false,
      })
    })

    it("should return isAdmin true for admin user", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue({ ...mockAuthUser, username: "admin" })
      mockUsers.getUser.mockResolvedValue(mockAdminUser)

      const result = await authenticateRequest(mockEvent)

      expect(result).toEqual({
        user: mockAdminUser,
        isAdmin: true,
      })
    })

    it("should throw error when no token provided", async () => {
      mockGetCookie.mockReturnValue(undefined)

      await expect(authenticateRequest(mockEvent)).rejects.toThrow("Authentifizierung erforderlich")

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 401,
        message: "Authentifizierung erforderlich",
      })
    })

    it("should throw error when token verification fails", async () => {
      const token = "invalid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockImplementation(() => {
        throw new Error("Invalid token")
      })

      await expect(authenticateRequest(mockEvent)).rejects.toThrow("Ungültiger Token")

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 401,
        message: "Ungültiger Token",
      })
    })

    it("should throw error when user not found", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue(mockAuthUser)
      mockUsers.getUser.mockResolvedValue(null)

      await expect(authenticateRequest(mockEvent)).rejects.toThrow("Ungültiger Benutzer")

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 401,
        message: "Ungültiger Benutzer",
      })
    })
  })

  describe("requireAdmin", () => {
    it("should return admin user when user is admin", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue({ ...mockAuthUser, username: "admin" })
      mockUsers.getUser.mockResolvedValue(mockAdminUser)

      const result = await requireAdmin(mockEvent)

      expect(result).toEqual(mockAdminUser)
    })

    it("should throw error when user is not admin", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue(mockAuthUser)
      mockUsers.getUser.mockResolvedValue(mockUser)

      await expect(requireAdmin(mockEvent)).rejects.toThrow("Admin-Berechtigung erforderlich")

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 403,
        message: "Admin-Berechtigung erforderlich",
      })
    })

    it("should throw error when authentication fails", async () => {
      mockGetCookie.mockReturnValue(undefined)

      await expect(requireAdmin(mockEvent)).rejects.toThrow("Authentifizierung erforderlich")
    })
  })

  describe("requireOwnershipOrAdmin", () => {
    it("should return user when user is admin", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue({ ...mockAuthUser, username: "admin" })
      mockUsers.getUser.mockResolvedValue(mockAdminUser)

      const result = await requireOwnershipOrAdmin(mockEvent, "someuser")

      expect(result).toEqual(mockAdminUser)
    })

    it("should return user when user owns the resource", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue(mockAuthUser)
      mockUsers.getUser.mockResolvedValue(mockUser)

      const result = await requireOwnershipOrAdmin(mockEvent, "testuser")

      expect(result).toEqual(mockUser)
    })

    it("should throw error when user is not owner and not admin", async () => {
      const token = "valid-token"
      mockGetCookie.mockReturnValue(token)
      mockUsers.verifyToken.mockReturnValue(mockAuthUser)
      mockUsers.getUser.mockResolvedValue(mockUser)

      await expect(requireOwnershipOrAdmin(mockEvent, "otheruser")).rejects.toThrow(
        "Keine Berechtigung für diese Ressource",
      )

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 403,
        message: "Keine Berechtigung für diese Ressource",
      })
    })
  })

  describe("getClientIP", () => {
    it("should return IP from x-forwarded-for header", () => {
      mockGetHeader.mockImplementation((event, header) => {
        if (header === "x-forwarded-for") return "203.0.113.1, 198.51.100.1"
        return undefined
      })

      const result = getClientIP(mockEvent)

      expect(result).toBe("203.0.113.1")
      expect(mockGetHeader).toHaveBeenCalledWith(mockEvent, "x-forwarded-for")
    })

    it("should return IP from x-real-ip header when x-forwarded-for is not available", () => {
      mockGetHeader.mockImplementation((event, header) => {
        if (header === "x-real-ip") return "203.0.113.2"
        return undefined
      })

      const result = getClientIP(mockEvent)

      expect(result).toBe("203.0.113.2")
      expect(mockGetHeader).toHaveBeenCalledWith(mockEvent, "x-real-ip")
    })

    it("should return remote address when headers are not available", () => {
      mockGetHeader.mockReturnValue(undefined)

      const result = getClientIP(mockEvent)

      expect(result).toBe("192.168.1.1")
    })

    it("should return 'unknown' when no IP information is available", () => {
      mockGetHeader.mockReturnValue(undefined)
      mockEvent.node.req.socket = undefined as any

      const result = getClientIP(mockEvent)

      expect(result).toBe("unknown")
    })
  })

  describe("getUserAgent", () => {
    it("should return user agent from header", () => {
      const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      mockGetHeader.mockReturnValue(userAgent)

      const result = getUserAgent(mockEvent)

      expect(result).toBe(userAgent)
      expect(mockGetHeader).toHaveBeenCalledWith(mockEvent, "user-agent")
    })

    it("should return 'unknown' when user agent header is not available", () => {
      mockGetHeader.mockReturnValue(undefined)

      const result = getUserAgent(mockEvent)

      expect(result).toBe("unknown")
    })
  })

  describe("getReferrer", () => {
    it("should return referrer from header", () => {
      const referrer = "https://example.com/page"
      mockGetHeader.mockReturnValue(referrer)

      const result = getReferrer(mockEvent)

      expect(result).toBe(referrer)
      expect(mockGetHeader).toHaveBeenCalledWith(mockEvent, "referer")
    })

    it("should return empty string when referrer header is not available", () => {
      mockGetHeader.mockReturnValue(undefined)

      const result = getReferrer(mockEvent)

      expect(result).toBe("")
    })
  })

  describe("setAuthCookie", () => {
    it("should set auth cookie with correct options in development", () => {
      const token = "test-token"
      process.env.NODE_ENV = "development"

      setAuthCookie(mockEvent, token)

      expect(mockSetCookie).toHaveBeenCalledWith(mockEvent, "auth-token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    })

    it("should set auth cookie with secure flag in production", () => {
      const token = "test-token"
      process.env.NODE_ENV = "production"

      setAuthCookie(mockEvent, token)

      expect(mockSetCookie).toHaveBeenCalledWith(mockEvent, "auth-token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    })
  })

  describe("clearAuthCookie", () => {
    it("should clear auth cookie with correct options in development", () => {
      process.env.NODE_ENV = "development"

      clearAuthCookie(mockEvent)

      expect(mockDeleteCookie).toHaveBeenCalledWith(mockEvent, "auth-token", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
      })
    })

    it("should clear auth cookie with secure flag in production", () => {
      process.env.NODE_ENV = "production"

      clearAuthCookie(mockEvent)

      expect(mockDeleteCookie).toHaveBeenCalledWith(mockEvent, "auth-token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      })
    })
  })

  describe("validateRequestBody", () => {
    interface TestBody {
      name: string
      email: string
      age?: number
    }

    it("should validate request body with all required fields", () => {
      const body = { name: "John", email: "john@example.com", age: 30 }
      const requiredFields: (keyof TestBody)[] = ["name", "email"]

      const result = validateRequestBody<TestBody>(body, requiredFields)

      expect(result).toEqual(body)
    })

    it("should throw error when body is null", () => {
      const requiredFields: (keyof TestBody)[] = ["name", "email"]

      expect(() => validateRequestBody<TestBody>(null, requiredFields)).toThrow("Request-Body ist erforderlich")

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Request-Body ist erforderlich",
      })
    })

    it("should throw error when body is not an object", () => {
      const requiredFields: (keyof TestBody)[] = ["name", "email"]

      expect(() => validateRequestBody<TestBody>("invalid", requiredFields)).toThrow("Request-Body ist erforderlich")
    })

    it("should throw error when required field is missing", () => {
      const body = { name: "John" }
      const requiredFields: (keyof TestBody)[] = ["name", "email"]

      expect(() => validateRequestBody<TestBody>(body, requiredFields)).toThrow("Feld 'email' ist erforderlich")

      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Feld 'email' ist erforderlich",
      })
    })

    it("should throw error when required field is null", () => {
      const body = { name: "John", email: null }
      const requiredFields: (keyof TestBody)[] = ["name", "email"]

      expect(() => validateRequestBody<TestBody>(body, requiredFields)).toThrow("Feld 'email' ist erforderlich")
    })

    it("should throw error when required field is undefined", () => {
      const body = { name: "John", email: undefined }
      const requiredFields: (keyof TestBody)[] = ["name", "email"]

      expect(() => validateRequestBody<TestBody>(body, requiredFields)).toThrow("Feld 'email' ist erforderlich")
    })
  })

  describe("validateUrl", () => {
    it("should return true for valid HTTP URL", () => {
      const result = validateUrl("http://example.com")
      expect(result).toBe(true)
    })

    it("should return true for valid HTTPS URL", () => {
      const result = validateUrl("https://example.com/path?query=value")
      expect(result).toBe(true)
    })

    it("should return true for valid URL with port", () => {
      const result = validateUrl("https://example.com:8080/path")
      expect(result).toBe(true)
    })

    it("should return false for invalid URL", () => {
      const result = validateUrl("not-a-url")
      expect(result).toBe(false)
    })

    it("should return false for empty string", () => {
      const result = validateUrl("")
      expect(result).toBe(false)
    })

    it("should return false for URL without protocol", () => {
      const result = validateUrl("example.com")
      expect(result).toBe(false)
    })
  })

  describe("sanitizeForCsv", () => {
    it("should return empty string for empty input", () => {
      expect(sanitizeForCsv("")).toBe("")
      expect(sanitizeForCsv(null as any)).toBe("")
      expect(sanitizeForCsv(undefined as any)).toBe("")
    })

    it("should escape double quotes", () => {
      const result = sanitizeForCsv('Hello "World"')
      expect(result).toBe('Hello ""World""')
    })

    it("should replace newlines with spaces", () => {
      expect(sanitizeForCsv("Line 1\nLine 2")).toBe("Line 1 Line 2")
      expect(sanitizeForCsv("Line 1\r\nLine 2")).toBe("Line 1 Line 2")
    })

    it("should handle both quotes and newlines", () => {
      const result = sanitizeForCsv('Hello "World"\nNext line')
      expect(result).toBe('Hello ""World"" Next line')
    })

    it("should return unchanged string when no special characters", () => {
      const input = "Simple text without special characters"
      expect(sanitizeForCsv(input)).toBe(input)
    })
  })

  describe("checkRateLimit", () => {
    beforeEach(() => {
      // Clear the rate limit map between tests
      clearRateLimit()
      vi.clearAllTimers()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("should allow first request", () => {
      const result = checkRateLimit("user1")
      expect(result).toBe(true)
    })

    it("should allow requests within limit", () => {
      const identifier = "user1"
      const maxRequests = 3

      expect(checkRateLimit(identifier, maxRequests)).toBe(true)
      expect(checkRateLimit(identifier, maxRequests)).toBe(true)
      expect(checkRateLimit(identifier, maxRequests)).toBe(true)
    })

    it("should block requests exceeding limit", () => {
      const identifier = "user1"
      const maxRequests = 2

      expect(checkRateLimit(identifier, maxRequests)).toBe(true)
      expect(checkRateLimit(identifier, maxRequests)).toBe(true)
      expect(checkRateLimit(identifier, maxRequests)).toBe(false)
      expect(checkRateLimit(identifier, maxRequests)).toBe(false)
    })

    it("should reset limit after window expires", () => {
      const identifier = "user1"
      const maxRequests = 2
      const windowMs = 60000

      // Use up the limit
      expect(checkRateLimit(identifier, maxRequests, windowMs)).toBe(true)
      expect(checkRateLimit(identifier, maxRequests, windowMs)).toBe(true)
      expect(checkRateLimit(identifier, maxRequests, windowMs)).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(windowMs + 1)

      // Should allow requests again
      expect(checkRateLimit(identifier, maxRequests, windowMs)).toBe(true)
    })

    it("should handle different identifiers separately", () => {
      const maxRequests = 1

      expect(checkRateLimit("user1", maxRequests)).toBe(true)
      expect(checkRateLimit("user2", maxRequests)).toBe(true)
      expect(checkRateLimit("user1", maxRequests)).toBe(false)
      expect(checkRateLimit("user2", maxRequests)).toBe(false)
    })

    it("should use default parameters", () => {
      const identifier = "user1"

      // Default is 10 requests
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(identifier)).toBe(true)
      }
      expect(checkRateLimit(identifier)).toBe(false)
    })
  })
})
