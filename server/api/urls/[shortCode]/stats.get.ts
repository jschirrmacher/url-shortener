import urlService from "~/utils/urlService"
import authService from "~/utils/authService"
import type { UrlStats } from "~/types/index"

export default defineEventHandler(async (event): Promise<UrlStats> => {
  try {
    // Authentifizierung prüfen
    const token = getCookie(event, "auth-token")

    if (!token) {
      throw createError({
        statusCode: 401,
        message: "Authentifizierung erforderlich",
      })
    }

    const decoded = authService.verifyToken(token)
    const user = await authService.getUser(decoded.username)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Ungültiger Benutzer",
      })
    }

    const shortCode = getRouterParam(event, "shortCode")

    if (!shortCode) {
      throw createError({
        statusCode: 400,
        message: "Short Code ist erforderlich",
      })
    }

    const stats: UrlStats | null = await urlService.getUrlStats(shortCode)

    if (!stats) {
      throw createError({
        statusCode: 404,
        message: "URL nicht gefunden",
      })
    }

    return stats
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
    throw createError({
      statusCode: 500,
      message: `Fehler beim Laden der Statistiken: ${errorMessage}`,
    })
  }
})
