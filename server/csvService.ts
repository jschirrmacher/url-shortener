import { promises as fs } from "node:fs"
import path from "node:path"

interface CsvRecord {
  [key: string]: string | number | boolean
}

function parseCsvLine(line: string) {
  return [...line.matchAll(/(?<=^|,)("(?:[^"]|"")*"|[^,]*)/g)].map(([field]) =>
    field.match(/^".*"$/) ? field.slice(1, -1).replace(/""/g, '"').replace(/\\n/g, "\n") : field.trim(),
  )
}

function formatValue(value: string | number | boolean | undefined | null) {
  const str = String(value ?? "")
  return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str
}

export default function useCsvService(customDataDir?: string) {
  const dataDir = customDataDir ?? "./data"
  let initialized = false

  async function ensureInitialized() {
    if (initialized) return

    try {
      await fs.mkdir(dataDir, { recursive: true })
      initialized = true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      throw new Error(`Failed to initialize CSV service: ${errorMessage}`)
    }
  }

  const ensureFileExists = async (filePath: string, headers: string[]) => {
    await ensureInitialized()
    try {
      await fs.access(filePath)
    } catch {
      await fs.writeFile(filePath, headers.join(",") + "\n", "utf8")
    }
  }

  const readCsv = async <T = CsvRecord>(filePath: string) => {
    await ensureInitialized()

    try {
      const content = await fs.readFile(filePath, "utf8")
      const lines = content.trim().split("\n")

      if (lines.length <= 1) return []

      const headers = parseCsvLine(lines[0]!)
      return lines.slice(1).map((line) => {
        const values = parseCsvLine(line)
        return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as T
      })
    } catch {
      return []
    }
  }

  const writeCsv = async (filePath: string, data: CsvRecord[], headers: string[]) => {
    await ensureInitialized()

    const content =
      [
        headers.map(formatValue).join(","),
        ...data.map((record) => headers.map((header) => formatValue(record[header])).join(",")),
      ].join("\n") + "\n"

    await fs.writeFile(filePath, content, "utf8")
  }

  const appendToCsv = async (filePath: string, record: CsvRecord, headers: string[]) => {
    await ensureInitialized()
    await ensureFileExists(filePath, headers)

    const line = headers.map((header) => formatValue(record[header])).join(",") + "\n"

    try {
      await fs.appendFile(filePath, line, "utf8")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      throw new Error(`Failed to append to CSV file ${filePath}: ${errorMessage}`)
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
    parseCsvLine,
  }
}

export const csvService = useCsvService()
