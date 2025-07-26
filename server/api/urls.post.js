import urlService from '~/utils/urlService.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.originalUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'originalUrl ist erforderlich'
      })
    }

    const result = await urlService.createShortUrl(body.originalUrl, body.customCode)
    
    return result
  } catch (error) {
    console.error('API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Interner Server-Fehler: ' + error.message
    })
  }
})
