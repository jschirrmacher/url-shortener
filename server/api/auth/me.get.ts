import { authenticateRequest } from '~/utils/apiAuth'
import type { User } from '~/types/index'

interface MeResponse {
  user: User
}

export default defineEventHandler(async (event): Promise<MeResponse> => {
  try {
    const { user } = await authenticateRequest(event)

    return { user }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Benutzer-Informationen konnten nicht geladen werden'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
