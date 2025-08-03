import useUsers from "~/server/useUsers"
import { setAuthCookie, validateRequestBody, checkRateLimit, getClientIP } from "~/utils/apiAuth"
import type { User } from "~/types/index"

interface LoginRequest {
  username: string
  password: string
}

export default defineEventHandler(async (event) => {
  try {
    const clientIP = getClientIP(event)
    if (!checkRateLimit(`login:${clientIP}`, 20, 300000)) {
      throw createError({
        statusCode: 429,
        message: "Zu viele Login-Versuche. Bitte warten Sie 5 Minuten.",
      })
    }

    const body = validateRequestBody<LoginRequest>(await readBody(event), ["username", "password"])

    const { username, password } = body

    const users = useUsers()
    const result = await users.authenticateUser(username, password)

    if (!result.success || !result.user || !result.token) {
      throw createError({
        statusCode: 401,
        message: result.message ?? "Ungültige Anmeldedaten",
      })
    }

    setAuthCookie(event, result.token)

    return {
      success: true,
      user: result.user as User,
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
