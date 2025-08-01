import useUsers from "~/server/useUsers"
import { requireAdmin } from "~/utils/apiAuth"

interface DeleteUserResponse {
  success: boolean
  message: string
}

export default defineEventHandler(async (event) => {
  try {
    const admin = await requireAdmin(event)

    const username = getRouterParam(event, "username")

    if (!username) {
      throw createError({
        statusCode: 400,
        message: "Benutzername ist erforderlich",
      })
    }

    if (username === admin.username) {
      throw createError({
        statusCode: 400,
        message: "Sie können sich nicht selbst löschen",
      })
    }

    const users = useUsers()
    const existingUser = await users.getUser(username)
    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: "Benutzer nicht gefunden",
      })
    }

    await users.deactivateUser(username)

    return {
      success: true,
      message: `Benutzer "${username}" wurde erfolgreich gelöscht`,
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Benutzer konnte nicht gelöscht werden"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
