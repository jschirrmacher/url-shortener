import { promises as fs } from "fs"
import path from "path"

interface CsvRecord {
  [key: string]: string | number | boolean
}

export default function useCsvService() {
  const dataDir = "./data"
  let initialized = false

  async function ensureInitialized() {
    if (initialized) return

    try {
      await fs.mkdir(dataDir, { recursive: true })
      initialized = true
    } catch (error: unknown) {
      console.error("CSV Service initialization failed:", error)
      throw new Error("Failed to initialize CSV service")
    }
  }

  const ensureFileExists = async (filePath: string, headers: string[]) => {
    await ensureInitialized()

    try {
      await fs.access(filePath)
    } catch (error: unknown) {
      const headerRow = headers.join(",") + "\n"
      await fs.writeFile(filePath, headerRow, "utf8")
    }
  }

  const readCsv = async <T = CsvRecord>(filePath: string) => {
    await ensureInitialized()

    try {
      const content = await fs.readFile(filePath, "utf8")
      const lines = content.trim().split("\n")

      if (lines.length <= 1) return []

      const headers = lines[0].split(",")
      return lines.slice(1).map((line) => {
        const values = line.split(",")
        const record: CsvRecord = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ""
        })
        return record as T
      })
    } catch (error: unknown) {
      console.error(`Error reading CSV file ${filePath}:`, error)
      return []
    }
  }

  const writeCsv = async (filePath: string, data: CsvRecord[], headers: string[]) => {
    await ensureInitialized()

    const headerRow = headers.join(",")
    const dataRows = data.map((record) => headers.map((header) => record[header] || "").join(","))

    const content = [headerRow, ...dataRows].join("\n") + "\n"

    await fs.writeFile(filePath, content, "utf8")
  }

  const appendToCsv = async (filePath: string, record: CsvRecord, headers: string[]) => {
    await ensureInitialized()

    // Ensure file exists with headers
    await ensureFileExists(filePath, headers)

    const values = headers.map((header) => {
      const value = record[header]
      if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value || "")
    })

    const line = values.join(",") + "\n"

    try {
      await fs.appendFile(filePath, line, "utf8")
    } catch (error: unknown) {
      console.error(`Error appending to CSV file ${filePath}:`, error)
      throw error
    }
  }

  const getDataDir = () => dataDir

  const getFilePath = (filename: string) => path.join(dataDir, filename)

  return {
    ensureInitialized,
    ensureFileExists,
    readCsv,
    writeCsv,
    appendToCsv,
    getDataDir,
    getFilePath,
  }
}
