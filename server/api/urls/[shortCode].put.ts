import useUrls from "~/server/useUrls"
import { authenticateRequest } from "~/utils/apiAuth"
import type { UpdateUrlRequest, UpdateUrlResponse, User, UrlRecord } from "~/types/index"

export default defineEventHandler(async (event) => {
  try {
    const { user: currentUser } = await authenticateRequest(event)

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

    const { getUrlByShortCode, updateUrl } = useUrls()
    const existingUrl: UrlRecord | null = await getUrlByShortCode(shortCode)

    if (!existingUrl) {
      throw createError({
        statusCode: 404,
        message: "URL nicht gefunden",
      })
    }

    if (currentUser.role !== "admin" && existingUrl.createdBy !== currentUser.username) {
      throw createError({
        statusCode: 403,
        message: "Keine Berechtigung zum Bearbeiten dieser URL",
      })
    }

    const result: UpdateUrlResponse = await updateUrl(shortCode, body.originalUrl, body.title)

    return result
  } catch (error: unknown) {
    console.error("Update API Error:", error)

    if (error && typeof error === "object" && "statusCode" in error && "message" in error) {
      throw createError({
        statusCode: (error as { statusCode: number }).statusCode,
        message: (error as { message: string }).message,
      })
    }

    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
    throw createError({
      statusCode: 500,
      message: `Interner Server-Fehler: ${errorMessage}`,
    })
  }
})
