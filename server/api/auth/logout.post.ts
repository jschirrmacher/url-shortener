import { clearAuthCookie } from '~/utils/apiAuth'

interface LogoutResponse {
  success: boolean
  message: string
}

export default defineEventHandler(async (event): Promise<LogoutResponse> => {
  try {
    // Lösche Auth-Cookie
    clearAuthCookie(event)

    return {
      success: true,
      message: 'Erfolgreich abgemeldet'
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Logout fehlgeschlagen'
    throw createError({
      statusCode: 500,
      message: errorMessage
    })
  }
})
