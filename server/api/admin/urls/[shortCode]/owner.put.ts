import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

export default defineEventHandler(async (event) => {
  const shortCode = getRouterParam(event, "shortCode")
  const { newOwner } = await readBody(event)

  if (!shortCode || !newOwner) {
    throw createError({
      statusCode: 400,
      statusMessage: "ShortCode and newOwner are required"
    })
  }

  const dataDir = process.env.DATA_DIR || join(process.cwd(), "data")
  const urlsFile = join(dataDir, "urls.csv")

  try {
    const content = readFileSync(urlsFile, "utf8")
    const lines = content.split("\n").filter(line => line.trim())
    
    let found = false
    const updatedLines = lines.map(line => {
      if (line.startsWith(shortCode + ",")) {
        found = true
        const parts = line.split(",")
        if (parts.length >= 5) {
          parts[4] = newOwner // createdBy is 5th column (index 4)
          return parts.join(",")
        }
      }
      return line
    })

    if (!found) {
      throw createError({
        statusCode: 404,
        statusMessage: "URL not found"
      })
    }

    writeFileSync(urlsFile, updatedLines.join("\n") + "\n", "utf8")
    
    return { success: true, message: "Owner changed successfully" }
  } catch (error) {
    console.error("Owner change error:", error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to change owner: " + errorMessage
    })
  }
})
