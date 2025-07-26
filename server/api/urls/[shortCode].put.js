import urlService from '~/utils/urlService.js'

export default defineEventHandler(async (event) => {
  try {
    const shortCode = getRouterParam(event, 'shortCode')
    const body = await readBody(event)
    
    if (!shortCode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Short Code ist erforderlich'
      })
    }

    if (!body.originalUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'originalUrl ist erforderlich'
      })
    }

    const result = await urlService.updateUrl(shortCode, body.originalUrl)
    
    return result
  } catch (error) {
    console.error('Update API Error:', error)
    
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Interner Server-Fehler: ' + error.message
    })
  }
})
