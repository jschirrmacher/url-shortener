import authService from '~/utils/authService'
import { requireAdmin } from '~/utils/apiAuth'

interface DeleteUserResponse {
  success: boolean
  message: string
}

export default defineEventHandler(async (event): Promise<DeleteUserResponse> => {
  try {
    // Prüfe Admin-Berechtigung
    const admin = await requireAdmin(event)

    // Hole Username aus URL-Parameter
    const username = getRouterParam(event, 'username')

    if (!username) {
      throw createError({
        statusCode: 400,
        message: 'Benutzername ist erforderlich',
      })
    }

    // Verhindere Selbstlöschung
    if (username === admin.username) {
      throw createError({
        statusCode: 400,
        message: 'Sie können sich nicht selbst löschen',
      })
    }

    // Prüfe ob Benutzer existiert
    const existingUser = await authService.getUser(username)
    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'Benutzer nicht gefunden',
      })
    }

    // Deaktiviere Benutzer (soft delete)
    await authService.deactivateUser(username)

    return {
      success: true,
      message: `Benutzer "${username}" wurde erfolgreich gelöscht`,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Benutzer konnte nicht gelöscht werden'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
