import fs from "fs/promises"
import path from "path"
import { createObjectCsvWriter } from "csv-writer"
import csv from "csv-parser"
import { createReadStream } from "fs"
import type { ClickRecord, UrlRecord } from "~/types/index"

interface CsvRecord {
  [key: string]: string | number | boolean
}

interface CsvWriterConfig {
  path: string
  header: Array<{ id: string; title: string }>
}

class CsvService {
  private readonly dataDir: string
  private readonly urlsFile: string
  private readonly clicksFile: string
  private readonly statsFile: string
  private initialized: boolean = false

  constructor() {
    this.dataDir = path.join(process.cwd(), "data")
    this.urlsFile = path.join(this.dataDir, "urls.csv")
    this.clicksFile = path.join(this.dataDir, "clicks.csv")
    this.statsFile = path.join(this.dataDir, "daily_stats.csv")
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return

    try {
      await fs.access(this.dataDir)
    } catch (error: unknown) {
      await fs.mkdir(this.dataDir, { recursive: true })
    }

    // Erstelle CSV-Dateien falls sie nicht existieren
    await this.ensureFileExists(this.urlsFile, ["shortCode", "originalUrl", "title", "createdAt", "createdBy"])

    await this.ensureFileExists(this.clicksFile, [
      "shortCode",
      "timestamp",
      "ip",
      "userAgent",
      "referrer",
      "sourceType",
    ])

    await this.ensureFileExists(this.statsFile, ["date", "shortCode", "clicks", "uniqueIps"])

    this.initialized = true
  }

  private async ensureFileExists(filePath: string, headers: string[]): Promise<void> {
    try {
      await fs.access(filePath)
    } catch (error: unknown) {
      // Datei existiert nicht, erstelle sie mit Headers
      const headerLine = headers.join(",") + "\n"
      await fs.writeFile(filePath, headerLine, "utf8")
    }
  }

  async readCsv<T = CsvRecord>(filePath: string): Promise<T[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const results: T[] = []

      createReadStream(filePath)
        .pipe(csv())
        .on("data", (data: T) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error: Error) => reject(error))
    })
  }

  async writeCsv(filePath: string, data: CsvRecord[], headers: string[]): Promise<void> {
    await this.ensureInitialized()

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers.map((h) => ({ id: h, title: h })),
    } as CsvWriterConfig)

    await csvWriter.writeRecords(data)
  }

  async appendToCsv(filePath: string, record: CsvRecord, headers: string[]): Promise<void> {
    await this.ensureInitialized()

    try {
      // Prüfe ob Datei existiert und Header hat
      const stats = await fs.stat(filePath)
      if (stats.size === 0) {
        // Datei ist leer, schreibe Header
        const headerLine = headers.join(",") + "\n"
        await fs.writeFile(filePath, headerLine, "utf8")
      }
    } catch (error: unknown) {
      // Datei existiert nicht, erstelle sie
      await this.ensureFileExists(filePath, headers)
    }

    // Erstelle CSV-Zeile aus Record
    const values = headers.map((header) => {
      const value = record[header]
      // Escape Kommas und Anführungszeichen
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value ?? "")
    })

    const csvLine = values.join(",") + "\n"
    await fs.appendFile(filePath, csvLine, "utf8")
  }

  // Spezielle Methoden für URL-Shortener
  async saveUrl(urlData: CsvRecord): Promise<void> {
    await this.appendToCsv(this.urlsFile, urlData, ["shortCode", "originalUrl", "title", "createdAt", "createdBy"])
  }

  async getUrls(): Promise<UrlRecord[]> {
    return this.readCsv<UrlRecord>(this.urlsFile)
  }

  async saveClick(clickData: CsvRecord): Promise<void> {
    await this.appendToCsv(this.clicksFile, clickData, [
      "shortCode",
      "timestamp",
      "ip",
      "userAgent",
      "referrer",
      "sourceType",
    ])
  }

  async getClicks(shortCode?: string): Promise<ClickRecord[]> {
    const allClicks = await this.readCsv<ClickRecord>(this.clicksFile)

    if (shortCode) {
      return allClicks.filter((click) => click.shortCode === shortCode)
    }

    return allClicks
  }

  async updateUrl(shortCode: string, updates: Partial<CsvRecord>): Promise<void> {
    const urls = await this.getUrls()
    const urlIndex = urls.findIndex((url) => url.shortCode === shortCode)

    if (urlIndex === -1) {
      throw new Error("URL nicht gefunden")
    }

    // Update URL record
    urls[urlIndex] = { ...urls[urlIndex], ...updates }

    // Schreibe alle URLs zurück
    await this.writeCsv(this.urlsFile, urls, ["shortCode", "originalUrl", "title", "createdAt", "createdBy"])
  }

  async deleteUrl(shortCode: string): Promise<void> {
    const urls = await this.getUrls()
    const filteredUrls = urls.filter((url) => url.shortCode !== shortCode)

    if (urls.length === filteredUrls.length) {
      throw new Error("URL nicht gefunden")
    }

    await this.writeCsv(this.urlsFile, filteredUrls, ["shortCode", "originalUrl", "title", "createdAt", "createdBy"])
  }

  // Statistik-Methoden
  async saveDailyStat(statData: CsvRecord): Promise<void> {
    await this.appendToCsv(this.statsFile, statData, ["date", "shortCode", "clicks", "uniqueIps"])
  }

  async getDailyStats(shortCode?: string): Promise<CsvRecord[]> {
    const allStats = await this.readCsv(this.statsFile)

    if (shortCode) {
      return allStats.filter((stat) => stat.shortCode === shortCode)
    }

    return allStats
  }
}

export default new CsvService()
