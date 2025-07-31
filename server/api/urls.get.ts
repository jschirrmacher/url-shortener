import urlService from "~/utils/urlService"
import { authenticateRequest } from "~/utils/apiAuth"
import type { UrlRecord } from "~/types/index"

export default defineEventHandler(async (event): Promise<UrlRecord[]> => {
  try {
    // Authentifiziere Request
    const { user } = await authenticateRequest(event)

    // Hole URLs des Benutzers
    const urls = await urlService.getUserUrls(user.username)

    return urls
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "URLs konnten nicht geladen werden"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
