import useUsers from "~/server/useUsers"
import { requireAdmin } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const username = getRouterParam(event, "username")

    if (!username) {
      throw createError({
        statusCode: 400,
        message: "Benutzername ist erforderlich",
      })
    }

    const users = useUsers()
    await users.reactivateUser(username)

    return {
      success: true,
      message: `Benutzer "${username}" wurde erfolgreich reaktiviert`,
      username,
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Benutzer konnte nicht reaktiviert werden"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
