import useUsers from "~/server/useUsers"
import { requireAdmin } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const users = useUsers()
    const allUsers = await users.getAllUsers()

    return allUsers
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Benutzer konnten nicht geladen werden"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
