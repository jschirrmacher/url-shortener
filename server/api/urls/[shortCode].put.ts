import urlService from "~/utils/urlService"
import authService from "~/utils/authService"
import type { UpdateUrlRequest, UpdateUrlResponse, User, UrlRecord } from "~/types/index"

export default defineEventHandler(async (event): Promise<UpdateUrlResponse> => {
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

    const currentUser: User = user

    const shortCode = getRouterParam(event, "shortCode")
    const body: UpdateUrlRequest = await readBody(event)

    if (!shortCode) {
      throw createError({
        statusCode: 400,
        message: "Short Code ist erforderlich",
      })
    }

    if (!body.originalUrl) {
      throw createError({
        statusCode: 400,
        message: "originalUrl ist erforderlich",
      })
    }

    // Prüfe Berechtigung für diese URL
    const existingUrl: UrlRecord | null = await urlService.getUrlByShortCode(shortCode)

    if (!existingUrl) {
      throw createError({
        statusCode: 404,
        message: "URL nicht gefunden",
      })
    }

    // Nur der Ersteller oder Admins dürfen bearbeiten
    if (currentUser.role !== "admin" && existingUrl.createdBy !== currentUser.username) {
      throw createError({
        statusCode: 403,
        message: "Keine Berechtigung zum Bearbeiten dieser URL",
      })
    }

    const result: UpdateUrlResponse = await urlService.updateUrl(shortCode, body.originalUrl, body.title)

    return result
  } catch (error: unknown) {
    console.error("Update API Error:", error)

    if (error && typeof error === "object" && "statusCode" in error) {
      throw createError({
        statusCode: (error as any).statusCode,
        message: (error as any).message,
      })
    }

    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
    throw createError({
      statusCode: 500,
      message: `Interner Server-Fehler: ${errorMessage}`,
    })
  }
})
