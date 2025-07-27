import urlService from '~/utils/urlService'
import {
  authenticateRequest,
  validateRequestBody,
  validateUrl,
  checkRateLimit,
  getClientIP,
} from '~/utils/apiAuth'

interface CreateUrlRequest {
  originalUrl: string
  customCode?: string
  title?: string
}

interface CreateUrlResponse {
  shortCode: string
  shortUrl: string
  originalUrl: string
  title?: string
}

export default defineEventHandler(async (event): Promise<CreateUrlResponse> => {
  try {
    // Authentifiziere Request
    const { user } = await authenticateRequest(event)

    // Rate Limiting pro Benutzer
    if (!checkRateLimit(`create-url:${user.username}`, 20, 3600000)) {
      // 20 URLs pro Stunde
      throw createError({
        statusCode: 429,
        message: 'Zu viele URL-Erstellungen. Bitte warten Sie eine Stunde.',
      })
    }

    // Validiere Request Body
    const body = validateRequestBody<CreateUrlRequest>(await readBody(event), ['originalUrl'])

    const { originalUrl, customCode, title } = body

    // Validiere URL
    if (!validateUrl(originalUrl)) {
      throw createError({
        statusCode: 400,
        message: 'Ungültige URL',
      })
    }

    // Validiere Custom Code falls vorhanden
    if (customCode) {
      if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
        throw createError({
          statusCode: 400,
          message:
            'Custom Code darf nur Buchstaben, Zahlen, Bindestriche und Unterstriche enthalten',
        })
      }

      if (customCode.length < 3 || customCode.length > 20) {
        throw createError({
          statusCode: 400,
          message: 'Custom Code muss zwischen 3 und 20 Zeichen lang sein',
        })
      }
    }

    // Erstelle Short-URL
    const result = await urlService.createShortUrl({
      originalUrl,
      customCode,
      title,
      createdBy: user.username,
    })

    return result
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : 'URL konnte nicht erstellt werden'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
