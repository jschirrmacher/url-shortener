import useUrls from "~/server/useUrls"
import useClickDataService from "~/server/clickDataService"
import { getClientIP, getUserAgent, getReferrer } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "GET") return

  const url = getRequestURL(event)
  const path = url.pathname

  // Skip API routes, static assets, and other special paths
  if (path.startsWith("/api/") || path.startsWith("/_nuxt/") || path.startsWith("/favicon.ico") || path.includes(".")) {
    return
  }

  // Only handle single-level paths that could be short codes
  const shortCodeMatch = path.match(/^\/(\w+)$/)
  if (!shortCodeMatch || !shortCodeMatch[1]) return

  const shortCode = shortCodeMatch[1]

  try {
    const { getUrlByShortCode } = useUrls()
    const { recordClick } = useClickDataService()

    const urlData = await getUrlByShortCode(shortCode)

    if (urlData) {
      try {        
        await recordClick({
          shortCode,
          ip: getClientIP(event),
          userAgent: getUserAgent(event),
          referrer: getReferrer(event),
          sourceType: url.searchParams.has('qr') ? 'qr-code' : 'direct',
        })
      } catch {
        // Click-Tracking-Fehler sollen Redirect nicht blockieren
      }

      await sendRedirect(event, urlData.originalUrl, 302)
    }
  } catch {
    // Bei Fehlern weiter zur normalen Route (404 Page)
  }
})
