import urlService from '~/utils/urlService'
import { getClientIP, getUserAgent, getReferrer } from '~/utils/apiAuth'

export default defineEventHandler(async (event): Promise<void> => {
  try {
    const shortCode = getRouterParam(event, 'shortCode')

    if (!shortCode) {
      throw createError({
        statusCode: 400,
        message: 'Short Code ist erforderlich',
      })
    }

    // Hole URL-Daten
    const url = await urlService.getUrlByShortCode(shortCode)

    if (!url) {
      throw createError({
        statusCode: 404,
        message: 'Short-URL nicht gefunden',
      })
    }

    // Erfasse Click-Daten für Analytics
    try {
      await urlService.recordClick(shortCode, {
        ip: getClientIP(event),
        userAgent: getUserAgent(event),
        referrer: getReferrer(event),
      })
    } catch (clickError: unknown) {
      // Click-Tracking-Fehler sollen Redirect nicht blockieren
      console.error('Click tracking error:', clickError)
    }

    // Redirect zur Original-URL
    await sendRedirect(event, url.originalUrl, 302)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : 'Redirect fehlgeschlagen'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
