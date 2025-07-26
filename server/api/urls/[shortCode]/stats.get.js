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

    const stats = await urlService.getUrlStats(shortCode)
    
    if (!stats) {
      throw createError({
        statusCode: 404,
        statusMessage: 'URL nicht gefunden'
      })
    }

    return stats
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Statistiken'
    })
  }
})
