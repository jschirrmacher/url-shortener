import useUrls from "~/server/useUrls"
import { getClientIP, getUserAgent, getReferrer } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "GET") return

  const url = getRequestURL(event)
  const path = url.pathname

  // Skip API routes, static assets, and other special paths
  if (path.startsWith("/api/") || path.startsWith("/_nuxt/") || path.startsWith("/favicon.ico") || path.includes(".")) {
    return
  }

  const shortCodeMatch = path.match(/^\/([a-z0-9]{6})$/i)
  if (!shortCodeMatch || !shortCodeMatch[1]) return

  const shortCode = shortCodeMatch[1]

  try {
    const { getUrlByShortCode, recordUrlAccess } = useUrls()

    const urlData = await getUrlByShortCode(shortCode)

    if (urlData) {
      try {
        await recordUrlAccess(shortCode, getClientIP(event), getUserAgent(event), getReferrer(event))
      } catch {
        // Click-Tracking-Fehler sollen Redirect nicht blockieren
      }

      await sendRedirect(event, urlData.originalUrl, 302)
    }
  } catch {
    // Bei Fehlern weiter zur normalen Route (404 Page)
  }
})
