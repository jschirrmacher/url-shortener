import useUrls from "~/server/useUrls"
import { authenticateRequest } from "~/utils/apiAuth"
import type { UrlStats } from "~/types/index"

export default defineEventHandler(async (event) => {
  try {
    await authenticateRequest(event)

    const shortCode = getRouterParam(event, "shortCode")
    const query = getQuery(event)
    
    // Pagination parameters
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 30
    const offset = (page - 1) * limit

    if (!shortCode) {
      throw createError({
        statusCode: 400,
        message: "Short Code ist erforderlich",
      })
    }

    const { getUrlStats } = useUrls()
    const stats: UrlStats | null = await getUrlStats(shortCode, { offset, limit })

    if (!stats) {
      throw createError({
        statusCode: 404,
        message: "URL nicht gefunden",
      })
    }

    // Add HAL _links
    const baseUrl = `/api/urls/${shortCode}/stats`
    const links: UrlStats['_links'] = {
      self: { href: `${baseUrl}?page=${page}&limit=${limit}` },
      first: { href: `${baseUrl}?page=1&limit=${limit}` },
      url: { href: `/api/urls/${shortCode}` }
    }

    // Add next link if there are more pages
    if (stats.hasMore) {
      links.next = { href: `${baseUrl}?page=${page + 1}&limit=${limit}` }
    }

    // Add prev link if not on first page
    if (page > 1) {
      links.prev = { href: `${baseUrl}?page=${page - 1}&limit=${limit}` }
    }

    return {
      ...stats,
      _links: links
    }
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
