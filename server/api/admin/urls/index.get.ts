import useUrls from "~/server/useUrls"
import { createHttpError } from "~/server/utils/ErrorCreator"
import { requireAdmin } from "~/utils/apiAuth"

export default defineEventHandler(async (event) => {
  // Require admin authentication
  await requireAdmin(event)

  try {
    const { getAllUrls } = useUrls()
    const urls = await getAllUrls()
    
    return urls
  } catch (error) {
    console.error("Failed to load URLs for admin:", error)
    throw createHttpError(500, "Fehler beim Laden der URLs")
  }
})
