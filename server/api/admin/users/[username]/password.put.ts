import useUsers from "~/server/useUsers"
import { requireAdmin, validateRequestBody } from "~/utils/apiAuth"

interface PasswordResetRequest {
  newPassword: string
}

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const targetUsername = getRouterParam(event, "username")
    if (!targetUsername) {
      throw createError({ statusCode: 400, message: "Benutzername ist erforderlich" })
    }

    const body = await readBody<PasswordResetRequest>(event)
    validateRequestBody(body, ["newPassword"])

    const { newPassword } = body

    if (!newPassword || newPassword.length < 8) {
      throw createError({ statusCode: 400, message: "Passwort muss mindestens 8 Zeichen lang sein" })
    }

    const { getUser, changePassword } = useUsers()

    const targetUser = await getUser(targetUsername)
    if (!targetUser) {
      throw createError({ statusCode: 404, message: "Benutzer nicht gefunden" })
    }

    if (!targetUser.active) {
      throw createError({ statusCode: 400, message: "Passwort kann nur für aktive Benutzer geändert werden" })
    }

    await changePassword(targetUsername, newPassword, true)

    return {
      success: true,
      message: `Passwort für Benutzer "${targetUsername}" wurde erfolgreich geändert`,
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Passwort-Reset fehlgeschlagen"
    throw createError({ statusCode: 500, message: errorMessage })
  }
})
