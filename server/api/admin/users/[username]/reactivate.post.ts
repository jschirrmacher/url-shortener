import authService from '~/utils/authService'
import { requireAdmin } from '~/utils/apiAuth'

interface ReactivateUserResponse {
  success: boolean
  message: string
  username: string
}

export default defineEventHandler(async (event): Promise<ReactivateUserResponse> => {
  try {
    // Prüfe Admin-Berechtigung
    await requireAdmin(event)

    // Hole Username aus URL-Parameter
    const username = getRouterParam(event, 'username')

    if (!username) {
      throw createError({
        statusCode: 400,
        message: 'Benutzername ist erforderlich',
      })
    }

    // Reaktiviere Benutzer
    await authService.reactivateUser(username)

    return {
      success: true,
      message: `Benutzer "${username}" wurde erfolgreich reaktiviert`,
      username,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Benutzer konnte nicht reaktiviert werden'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
