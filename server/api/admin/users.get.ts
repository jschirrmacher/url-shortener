import authService from '~/utils/authService'
import { requireAdmin } from '~/utils/apiAuth'
import type { User } from '~/types/index'

export default defineEventHandler(async (event): Promise<User[]> => {
  try {
    // Prüfe Admin-Berechtigung
    await requireAdmin(event)

    // Hole alle Benutzer
    const users = await authService.getAllUsers()

    return users
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Benutzer konnten nicht geladen werden'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
