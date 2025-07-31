import authService from "~/utils/authService"
import { setAuthCookie, validateRequestBody, checkRateLimit, getClientIP } from "~/utils/apiAuth"
import type { User } from "~/types/index"

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  user: User
  message?: string
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  try {
    // Rate Limiting (temporär erhöht für Testing)
    const clientIP = getClientIP(event)
    if (!checkRateLimit(`login:${clientIP}`, 20, 300000)) {
      // 20 Versuche in 5 Minuten
      throw createError({
        statusCode: 429,
        message: "Zu viele Login-Versuche. Bitte warten Sie 5 Minuten.",
      })
    }

    // Validiere Request Body
    const body = validateRequestBody<LoginRequest>(await readBody(event), ["username", "password"])

    const { username, password } = body

    // Authentifiziere Benutzer
    const result = await authService.authenticateUser(username, password)

    if (!result.success || !result.user || !result.token) {
      throw createError({
        statusCode: 401,
        message: result.message ?? "Ungültige Anmeldedaten",
      })
    }

    // Setze Auth-Cookie
    setAuthCookie(event, result.token)

    return {
      success: true,
      user: result.user,
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Login fehlgeschlagen"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
