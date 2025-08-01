import useUrls from "~/server/useUrls"
import { authenticateRequest } from "~/utils/apiAuth"
import type { UrlStats } from "~/types/index"

export default defineEventHandler(async (event) => {
  try {
    await authenticateRequest(event)

    const shortCode = getRouterParam(event, "shortCode")

    if (!shortCode) {
      throw createError({
        statusCode: 400,
        message: "Short Code ist erforderlich",
      })
    }

    const { getUrlStats } = useUrls()
    const stats: UrlStats | null = await getUrlStats(shortCode)

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
