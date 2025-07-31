import authService from "~/utils/authService"
import { authenticateRequest, validateRequestBody } from "~/utils/apiAuth"

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface ChangePasswordResponse {
  success: boolean
  message: string
}

export default defineEventHandler(async (event): Promise<ChangePasswordResponse> => {
  try {
    // Authentifiziere Request
    const { user } = await authenticateRequest(event)

    // Validiere Request Body
    const body = validateRequestBody<ChangePasswordRequest>(await readBody(event), ["currentPassword", "newPassword"])

    const { currentPassword, newPassword } = body

    // Validiere neues Passwort
    if (newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        message: "Neues Passwort muss mindestens 6 Zeichen lang sein",
      })
    }

    if (currentPassword === newPassword) {
      throw createError({
        statusCode: 400,
        message: "Neues Passwort muss sich vom aktuellen unterscheiden",
      })
    }

    // Ändere Passwort
    await authService.changePassword(user.username, currentPassword, newPassword)

    return {
      success: true,
      message: "Passwort erfolgreich geändert",
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Passwort-Änderung fehlgeschlagen"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
