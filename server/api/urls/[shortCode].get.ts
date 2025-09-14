import useUrls from "~/server/useUrls"
import { authenticateRequest } from "~/utils/apiAuth"
import type { UrlRecord } from "~/types/index"

export default defineEventHandler(async (event) => {
  try {
    const { user: currentUser } = await authenticateRequest(event)

    const shortCode = getRouterParam(event, "shortCode")

    if (!shortCode) {
      throw createError({
        statusCode: 400,
        message: "Short Code ist erforderlich",
      })
    }

    const { getUrlByShortCode } = useUrls()
    const url: UrlRecord | null = await getUrlByShortCode(shortCode)

    if (!url) {
      throw createError({
        statusCode: 404,
        message: "URL nicht gefunden",
      })
    }

    // Check permissions - users can only see their own URLs, admins can see all
    if (currentUser.role !== "admin" && url.createdBy !== currentUser.username) {
      throw createError({
        statusCode: 403,
        message: "Keine Berechtigung zum Anzeigen dieser URL",
      })
    }

    return url
  } catch (error: unknown) {
    // Handle errors appropriately
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
