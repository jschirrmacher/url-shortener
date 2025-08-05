import useUrls from "~/server/useUrls"
import { getClientIP, getUserAgent, getReferrer } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  // Nur für GET-Requests
  if (event.node.req.method !== 'GET') return

  const url = getRequestURL(event)
  const path = url.pathname

  // Prüfe ob es ein Short-Code Pattern ist (6 Zeichen alphanumerisch, Root-Level)
  const shortCodeMatch = path.match(/^\/([a-z0-9]{6})$/i)
  if (!shortCodeMatch) return

  const shortCode = shortCodeMatch[1]

  try {
    const { getUrlByShortCode, recordUrlAccess } = useUrls()

    // Hole URL-Daten
    const urlData = await getUrlByShortCode(shortCode)

    if (urlData) {
      // Erfasse Click-Daten für Analytics
      try {
        await recordUrlAccess(shortCode, getClientIP(event), getUserAgent(event), getReferrer(event))
      } catch {
        // Click-Tracking-Fehler sollen Redirect nicht blockieren
      }

      // Sofortiger Server-seitiger Redirect zur Original-URL
      await sendRedirect(event, urlData.originalUrl, 302)
    }
  } catch {
    // Bei Fehlern weiter zur normalen Route (404 Page)
  }
})
