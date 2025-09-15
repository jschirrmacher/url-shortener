import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"

export default defineEventHandler(async () => {
  // Only allow in test environment
  if (process.env.NODE_ENV !== "test" && !process.env.DATA_DIR?.includes("test-data")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Cleanup only allowed in test environment"
    })
  }

  const dataDir = process.env.DATA_DIR ?? join(process.cwd(), "data")
  const urlsFile = join(dataDir, "urls.csv")
  const clicksFile = join(dataDir, "clicks.csv")

  try {
    // Clean URLs file - keep only header
    if (existsSync(urlsFile)) {
      const content = readFileSync(urlsFile, "utf8")
      const lines = content.split("\n")
      if (lines.length > 0) {
        writeFileSync(urlsFile, lines[0] + "\n", "utf8")
      }
    }

    // Clean clicks file - keep only header
    if (existsSync(clicksFile)) {
      const content = readFileSync(clicksFile, "utf8")
      const lines = content.split("\n")
      if (lines.length > 0) {
        writeFileSync(clicksFile, lines[0] + "\n", "utf8")
      }
    }

    return { success: true, message: "Test data cleaned up" }
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to cleanup test data"
    })
  }
})
