import useUsers from "~/server/useUsers"
import type { AuthUser } from "~/types/index"
import { getCookie, setCookie, deleteCookie, getHeader, createError, type H3Event } from "h3"

export async function authenticateRequest(event: H3Event) {
  const token = getCookie(event, "auth-token")

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Authentifizierung erforderlich",
    })
  }

  let decoded: AuthUser
  try {
    const users = useUsers()
    decoded = users.verifyToken(token)
  } catch (_error: unknown) {
    void _error // Acknowledge the error parameter
    throw createError({
      statusCode: 401,
      message: "Ungültiger Token",
    })
  }

  const users = useUsers()
  const user = await users.getUser(decoded.username)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Ungültiger Benutzer",
    })
  }

  return {
    user,
    isAdmin: user.role === "admin",
  }
}

export async function requireAdmin(event: H3Event) {
  const { user, isAdmin } = await authenticateRequest(event)

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: "Admin-Berechtigung erforderlich",
    })
  }

  return user
}

export async function requireOwnershipOrAdmin(event: H3Event, resourceOwner: string) {
  const { user, isAdmin } = await authenticateRequest(event)

  if (!isAdmin && user.username !== resourceOwner) {
    throw createError({
      statusCode: 403,
      message: "Keine Berechtigung für diese Ressource",
    })
  }

  return user
}

export function getClientIP(event: H3Event) {
  const forwarded = getHeader(event, "x-forwarded-for")
  const realIP = getHeader(event, "x-real-ip")
  const remoteAddress = event.node.req.socket?.remoteAddress

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim()
  }

  if (typeof realIP === "string") {
    return realIP
  }

  return remoteAddress ?? "unknown"
}

export function getUserAgent(event: H3Event) {
  return getHeader(event, "user-agent") ?? "unknown"
}

export function getReferrer(event: H3Event) {
  return getHeader(event, "referer") ?? ""
}

export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, "auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, "auth-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })
}

export function validateRequestBody<T>(body: unknown, requiredFields: (keyof T)[]) {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      message: "Request-Body ist erforderlich",
    })
  }

  const bodyObj = body as Record<string, unknown>

  for (const field of requiredFields) {
    if (!(field in bodyObj) || bodyObj[field as string] === null || bodyObj[field as string] === undefined) {
      throw createError({
        statusCode: 400,
        message: `Feld '${String(field)}' ist erforderlich`,
      })
    }
  }

  return body as T
}

export function validateUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch (_error: unknown) {
    void _error // Acknowledge the error parameter
    return false
  }
}

export function sanitizeForCsv(value: string) {
  if (!value) return ""
  return value.replace(/"/g, '""').replace(/\r?\n/g, " ")
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export function clearRateLimit() {
  rateLimitMap.clear()
}

export default {
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
}
