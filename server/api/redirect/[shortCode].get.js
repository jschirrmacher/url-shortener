import urlService from '~/utils/urlService.js'

export default defineEventHandler(async (event) => {
  try {
    const shortCode = getRouterParam(event, 'shortCode')
    
    if (!shortCode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Short Code ist erforderlich'
      })
    }

    const originalUrl = await urlService.getOriginalUrl(shortCode)
    
    if (!originalUrl) {
      throw createError({
        statusCode: 404,
        statusMessage: 'URL nicht gefunden'
      })
    }

    // Tracking des Klicks
    await urlService.trackClick(shortCode, event)

    // Prüfe Accept-Header für JSON-Requests
    const headers = event.node?.req?.headers || {}
    const acceptHeader = headers['accept'] || ''
    
    // Für JSON-API-Aufrufe: JSON Response
    if (acceptHeader.includes('application/json')) {
      return {
        redirectUrl: originalUrl,
        shortCode,
        tracked: true
      }
    }

    // Für alle anderen (Browser): Direkte HTTP-Weiterleitung
    await sendRedirect(event, originalUrl, 302)
  } catch (error) {
    console.error('Redirect API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler bei der Weiterleitung: ' + error.message
    })
  }
})
