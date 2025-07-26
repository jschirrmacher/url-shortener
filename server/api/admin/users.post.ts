import authService from '~/utils/authService'
import { requireAdmin, validateRequestBody } from '~/utils/apiAuth'
import type { User } from '~/types/index'

interface CreateUserRequest {
  username: string
  password: string
  role?: 'admin' | 'user'
}

interface CreateUserResponse {
  success: boolean
  user: User
  message: string
}

export default defineEventHandler(async (event): Promise<CreateUserResponse> => {
  try {
    // Prüfe Admin-Berechtigung
    await requireAdmin(event)
    
    // Validiere Request Body
    const body = validateRequestBody<CreateUserRequest>(
      await readBody(event), 
      ['username', 'password']
    )
    
    const { username, password, role = 'user' } = body

    // Validiere Eingaben
    if (username.length < 3) {
      throw createError({
        statusCode: 400,
        message: 'Benutzername muss mindestens 3 Zeichen lang sein'
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'Passwort muss mindestens 6 Zeichen lang sein'
      })
    }

    if (!['admin', 'user'].includes(role)) {
      throw createError({
        statusCode: 400,
        message: 'Ungültige Rolle'
      })
    }

    // Erstelle Benutzer
    const user = await authService.createUser({
      username,
      password,
      role
    })

    return {
      success: true,
      user,
      message: `Benutzer "${username}" erfolgreich erstellt`
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Benutzer konnte nicht erstellt werden'
    throw createError({
      statusCode: 500,
      message: errorMessage
    })
  }
})
