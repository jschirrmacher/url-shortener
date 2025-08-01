import useUrls from "~/server/useUrls"
import { authenticateRequest } from "~/utils/apiAuth"
import type { UrlRecord } from "~/types/index"

export default defineEventHandler(async (event) => {
  try {
    // Authentifiziere Request
    const { user } = await authenticateRequest(event)

    // Hole URLs des Benutzers mit Statistiken
    const { getUrlsWithStats } = useUrls()
    const userUrls = await getUrlsWithStats(user.username)

    return userUrls
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
