import useUrls from "~/server/useUrls"
import { getClientIP, getUserAgent, getReferrer } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  try {
    const shortCode = getRouterParam(event, "shortCode")

    if (!shortCode) {
      throw createError({
        statusCode: 400,
        message: "Short Code ist erforderlich",
      })
    }

    const { getUrlByShortCode, recordUrlAccess } = useUrls()

    // Hole URL-Daten
    const url = await getUrlByShortCode(shortCode)

    if (!url) {
      throw createError({
        statusCode: 404,
        message: "Short-URL nicht gefunden",
      })
    }

    // Erfasse Click-Daten für Analytics
    try {
      await recordUrlAccess(shortCode, getClientIP(event), getUserAgent(event), getReferrer(event))
    } catch (clickError: unknown) {
      // Click-Tracking-Fehler sollen Redirect nicht blockieren
      console.error("Click tracking error:", clickError)
    }

    // Redirect zur Original-URL
    await sendRedirect(event, url.originalUrl, 302)
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Redirect fehlgeschlagen"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
