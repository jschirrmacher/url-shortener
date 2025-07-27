import authService from '~/utils/authService'
import { requireAdmin, validateRequestBody } from '~/utils/apiAuth'

interface UpdateRoleRequest {
  role: 'admin' | 'user'
}

interface UpdateRoleResponse {
  success: boolean
  message: string
  username: string
  newRole: 'admin' | 'user'
}

export default defineEventHandler(async (event): Promise<UpdateRoleResponse> => {
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

    // Validiere Request Body
    const body = validateRequestBody<UpdateRoleRequest>(await readBody(event), ['role'])

    const { role } = body

    // Validiere Rolle
    if (!['admin', 'user'].includes(role)) {
      throw createError({
        statusCode: 400,
        message: 'Ungültige Rolle. Erlaubt: admin, user',
      })
    }

    // Verhindere Selbst-Degradierung des letzten Admins
    if (username === admin.username && role === 'user') {
      // Prüfe ob es andere Admins gibt
      const allUsers = await authService.getAllUsers()
      const adminCount = allUsers.filter(u => u.role === 'admin').length

      if (adminCount <= 1) {
        throw createError({
          statusCode: 400,
          message: 'Sie können sich nicht selbst degradieren, da Sie der einzige Admin sind',
        })
      }
    }

    // Prüfe ob Benutzer existiert
    const existingUser = await authService.getUser(username)
    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'Benutzer nicht gefunden',
      })
    }

    // Update Rolle
    await authService.updateUserRole(username, role)

    return {
      success: true,
      message: `Rolle von "${username}" wurde erfolgreich zu "${role}" geändert`,
      username,
      newRole: role,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Rolle konnte nicht geändert werden'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
