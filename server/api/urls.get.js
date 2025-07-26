import urlService from '~/utils/urlService.js'

export default defineEventHandler(async (event) => {
  try {
    const urls = await urlService.getAllUrls()
    return urls
  } catch (error) {
    console.error('URLs List API Error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der URLs: ' + error.message
    })
  }
})
