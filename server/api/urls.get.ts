import useUrls from "~/server/useUrls"
import { authenticateRequest } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  try {
    // Authentifiziere Request
    const { user } = await authenticateRequest(event)

    // Hole URLs mit Statistiken
    const { getUrlsWithStats } = useUrls()
    
    // Admin sieht alle URLs, normale User nur ihre eigenen
    const username = user.role === 'admin' ? undefined : user.username
    const urls = await getUrlsWithStats(username)

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
