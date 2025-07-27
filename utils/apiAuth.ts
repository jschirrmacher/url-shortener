import authService from './authService'
import type { User, AuthUser } from '~/types/index'

interface AuthResult {
  user: User
  isAdmin: boolean
}

/**
 * Authentifiziert einen API-Request über Cookie-Token
 */
export async function authenticateRequest(event: any): Promise<AuthResult> {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentifizierung erforderlich',
    })
  }

  try {
    const decoded: AuthUser = authService.verifyToken(token)
    const user = await authService.getUser(decoded.username)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Ungültiger Benutzer',
      })
    }

    return {
      user,
      isAdmin: user.role === 'admin',
    }
  } catch (error: unknown) {
    throw createError({
      statusCode: 401,
      message: 'Ungültiger Token',
    })
  }
}

/**
 * Prüft Admin-Berechtigung für API-Request
 */
export async function requireAdmin(event: any): Promise<User> {
  const { user, isAdmin } = await authenticateRequest(event)

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Admin-Berechtigung erforderlich',
    })
  }

  return user
}

/**
 * Prüft ob Benutzer Zugriff auf Ressource hat (eigene oder Admin)
 */
export async function requireOwnershipOrAdmin(event: any, resourceOwner: string): Promise<User> {
  const { user, isAdmin } = await authenticateRequest(event)

  if (!isAdmin && user.username !== resourceOwner) {
    throw createError({
      statusCode: 403,
      message: 'Keine Berechtigung für diese Ressource',
    })
  }

  return user
}

/**
 * Extrahiert Client-IP aus Request
 */
export function getClientIP(event: any): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const remoteAddress = event.node.req.socket?.remoteAddress

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }

  if (typeof realIP === 'string') {
    return realIP
  }

  return remoteAddress ?? 'unknown'
}

/**
 * Extrahiert User-Agent aus Request
 */
export function getUserAgent(event: any): string {
  return getHeader(event, 'user-agent') ?? 'unknown'
}

/**
 * Extrahiert Referrer aus Request
 */
export function getReferrer(event: any): string {
  return getHeader(event, 'referer') ?? ''
}

/**
 * Setzt Auth-Cookie mit sicheren Einstellungen
 */
export function setAuthCookie(event: any, token: string): void {
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 Tage
    path: '/',
  })
}

/**
 * Löscht Auth-Cookie
 */
export function clearAuthCookie(event: any): void {
  deleteCookie(event, 'auth-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })
}

/**
 * Validiert Request-Body gegen Schema
 */
export function validateRequestBody<T>(body: any, requiredFields: (keyof T)[]): T {
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Request-Body ist erforderlich',
    })
  }

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      throw createError({
        statusCode: 400,
        message: `Feld '${String(field)}' ist erforderlich`,
      })
    }
  }

  return body as T
}

/**
 * Validiert URL-Format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (error: unknown) {
    return false
  }
}

/**
 * Sanitize String für CSV-Speicherung
 */
export function sanitizeForCsv(value: string): string {
  if (!value) return ''

  // Escape Anführungszeichen und Kommas
  return value.replace(/"/g, '""').replace(/\r?\n/g, ' ')
}

/**
 * Rate Limiting Helper (einfache In-Memory-Implementierung)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
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
}
