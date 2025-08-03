import useUsers from "~/server/useUsers"
import { authenticateRequest, validateRequestBody } from "~/utils/apiAuth"

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export default defineEventHandler(async (event) => {
  try {
    const { user } = await authenticateRequest(event)

    const body = validateRequestBody<ChangePasswordRequest>(await readBody(event), ["currentPassword", "newPassword"])

    const { currentPassword, newPassword } = body

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

    const { changePassword, getUser } = useUsers()
    const existingUser = await getUser(user.username)
    if (!existingUser) {
      throw createError({ statusCode: 404, message: "Benutzer nicht gefunden" })
    }

    await changePassword(user.username, newPassword, user.role === "admin", currentPassword)
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
