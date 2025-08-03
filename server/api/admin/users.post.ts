import useUsers from "~/server/useUsers"
import { requireAdmin, validateRequestBody } from "~/utils/apiAuth"

interface CreateUserRequest {
  username: string
  password: string
  role?: "admin" | "user"
}

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const body = validateRequestBody<CreateUserRequest>(await readBody(event), ["username", "password"])

    const { username, password, role = "user" } = body

    // Validiere Eingaben
    if (username.length < 3) {
      throw createError({ statusCode: 400, message: "Benutzername muss mindestens 3 Zeichen lang sein" })
    }

    if (password.length < 6) {
      throw createError({ statusCode: 400, message: "Passwort muss mindestens 6 Zeichen lang sein" })
    }

    if (!["admin", "user"].includes(role)) {
      throw createError({ statusCode: 400, message: "Ungültige Rolle" })
    }

    const users = useUsers()
    const user = await users.createUser({ username, password, role })

    return {
      success: true,
      user,
      message: `Benutzer "${username}" erfolgreich erstellt`,
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : "Benutzer konnte nicht erstellt werden"
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})
