import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { promises as fs } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import useCsvService from "~/server/csvService"

describe("csvService", () => {
  let csvService: ReturnType<typeof useCsvService>
  let testDataDir: string
  let testFilePath: string
  const testHeaders = ["id", "name", "email"]

  beforeEach(async () => {
    // Create unique temp directory for each test
    testDataDir = path.join(tmpdir(), `csvservice-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    testFilePath = path.join(testDataDir, "test.csv")
    csvService = useCsvService(testDataDir)
  })

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe("ensureInitialized", () => {
    it("should create data directory if it doesn't exist", async () => {
      await csvService.ensureInitialized()

      const stats = await fs.stat(testDataDir)
      expect(stats.isDirectory()).toBe(true)
    })

    it("should only initialize once", async () => {
      await csvService.ensureInitialized()
      const firstStats = await fs.stat(testDataDir)
      
      await csvService.ensureInitialized()
      const secondStats = await fs.stat(testDataDir)
      
      expect(firstStats.birthtime).toEqual(secondStats.birthtime)
    })

    it("should throw error if mkdir fails", async () => {
      // Create a file with the same name as the directory to cause mkdir to fail
      await fs.writeFile(testDataDir, "blocking file")

      await expect(csvService.ensureInitialized()).rejects.toThrow("Failed to initialize CSV service")
      
      // Clean up
      await fs.unlink(testDataDir)
    })
  })

  describe("ensureFileExists", () => {
    it("should not create file if it already exists", async () => {
      await csvService.ensureInitialized()
      await fs.writeFile(testFilePath, "existing content")
      const originalStats = await fs.stat(testFilePath)

      await csvService.ensureFileExists(testFilePath, testHeaders)

      const newStats = await fs.stat(testFilePath)
      expect(newStats.mtime).toEqual(originalStats.mtime)
      
      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("existing content")
    })

    it("should create file with headers if it doesn't exist", async () => {
      await csvService.ensureFileExists(testFilePath, testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("id,name,email\n")
    })
  })

  describe("readCsv", () => {
    it("should return empty array for empty file", async () => {
      await csvService.ensureInitialized()
      await fs.writeFile(testFilePath, "")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([])
    })

    it("should return empty array for file with only headers", async () => {
      await csvService.ensureInitialized()
      await fs.writeFile(testFilePath, "id,name,email\n")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([])
    })

    it("should parse CSV data correctly", async () => {
      await csvService.ensureInitialized()
      await fs.writeFile(testFilePath, "id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com\n")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([
        { id: "1", name: "John Doe", email: "john@example.com" },
        { id: "2", name: "Jane Smith", email: "jane@example.com" },
      ])
    })

    it("should handle missing values", async () => {
      await csvService.ensureInitialized()
      await fs.writeFile(testFilePath, "id,name,email\n1,John Doe,\n2,,jane@example.com\n")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([
        { id: "1", name: "John Doe", email: "" },
        { id: "2", name: "", email: "jane@example.com" },
      ])
    })

    it("should return empty array on read error", async () => {
      const result = await csvService.readCsv("/nonexistent/path/file.csv")

      expect(result).toEqual([])
    })

    it("should support generic typing", async () => {
      interface TestRecord {
        id: string
        name: string
        email: string
      }

      await csvService.ensureInitialized()
      await fs.writeFile(testFilePath, "id,name,email\n1,John,john@test.com\n")

      const result = await csvService.readCsv<TestRecord>(testFilePath)

      expect(result).toEqual([{ id: "1", name: "John", email: "john@test.com" }])
    })
  })

  describe("writeCsv", () => {
    it("should write CSV data with headers", async () => {
      const data = [
        { id: "1", name: "John Doe", email: "john@example.com" },
        { id: "2", name: "Jane Smith", email: "jane@example.com" },
      ]

      await csvService.writeCsv(testFilePath, data, testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com\n")
    })

    it("should handle empty data", async () => {
      await csvService.writeCsv(testFilePath, [], testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("id,name,email\n")
    })

    it("should handle missing values", async () => {
      const data = [
        { id: "1", name: "John Doe", email: "" }, // missing email
        { id: "2", name: "", email: "jane@example.com" }, // missing name
      ]

      await csvService.writeCsv(testFilePath, data, testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("id,name,email\n1,John Doe,\n2,,jane@example.com\n")
    })
  })

  describe("appendToCsv", () => {
    it("should append record to existing file", async () => {
      await csvService.ensureInitialized()
      await fs.writeFile(testFilePath, "id,name,email\n1,John,john@test.com\n")
      
      const record = { id: "2", name: "Bob", email: "bob@test.com" }
      await csvService.appendToCsv(testFilePath, record, testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("id,name,email\n1,John,john@test.com\n2,Bob,bob@test.com\n")
    })

    it("should create file with headers if it doesn't exist", async () => {
      const record = { id: "1", name: "John", email: "john@test.com" }
      
      await csvService.appendToCsv(testFilePath, record, testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("id,name,email\n1,John,john@test.com\n")
    })

    it("should escape CSV special characters", async () => {
      const record = { id: "1", name: 'John "Johnny" Doe', email: "john@example.com, backup@test.com" }
      
      await csvService.appendToCsv(testFilePath, record, testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe('id,name,email\n1,"John ""Johnny"" Doe","john@example.com, backup@test.com"\n')
    })

    it("should handle newlines in data", async () => {
      const record = { id: "1", name: "John\nDoe", email: "john@test.com" }
      
      await csvService.appendToCsv(testFilePath, record, testHeaders)

      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe('id,name,email\n1,"John\nDoe",john@test.com\n')
    })

    it("should throw error on append failure", async () => {
      // Create directory with same name as file to cause append to fail
      await csvService.ensureInitialized()
      await fs.mkdir(testFilePath)

      const record = { id: "1", name: "John", email: "john@test.com" }

      await expect(csvService.appendToCsv(testFilePath, record, testHeaders)).rejects.toThrow()
    })
  })

  describe("utility methods", () => {
    it("should return correct data directory", () => {
      expect(csvService.getDataDir()).toBe(testDataDir)
    })

    it("should return correct file path", () => {
      expect(csvService.getFilePath("test.csv")).toBe(path.join(testDataDir, "test.csv"))
    })
  })

  describe("integration scenarios", () => {
    it("should handle complete workflow: create, write, read, append", async () => {
      const initialData = [
        { id: "1", name: "John", email: "john@test.com" },
        { id: "2", name: "Jane", email: "jane@test.com" },
      ]
      const newRecord = { id: "3", name: "Bob", email: "bob@test.com" }

      // Write initial data
      await csvService.writeCsv(testFilePath, initialData, testHeaders)

      // Read data back
      const readData = await csvService.readCsv(testFilePath)
      expect(readData).toEqual(initialData)

      // Append new record
      await csvService.appendToCsv(testFilePath, newRecord, testHeaders)

      // Read updated data
      const updatedData = await csvService.readCsv(testFilePath)
      expect(updatedData).toEqual([...initialData, newRecord])

      // Verify file content
      const content = await fs.readFile(testFilePath, "utf8")
      expect(content).toBe("id,name,email\n1,John,john@test.com\n2,Jane,jane@test.com\n3,Bob,bob@test.com\n")
    })
  })
})
