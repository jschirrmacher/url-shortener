import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { promises as fs } from "fs"
import path from "path"
import useCsvService from "~/utils/csvService"

// Mock fs module
vi.mock("fs", () => ({
  promises: {
    mkdir: vi.fn(),
    access: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    appendFile: vi.fn(),
  },
}))

const mockFs = vi.mocked(fs)

describe("csvService", () => {
  let csvService: ReturnType<typeof useCsvService>
  const testDataDir = "./data"
  const testFilePath = "./data/test.csv"
  const testHeaders = ["id", "name", "email"]

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Create fresh instance for each test
    csvService = useCsvService()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("ensureInitialized", () => {
    it("should create data directory if it doesn't exist", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)

      await csvService.ensureInitialized()

      expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true })
    })

    it("should only initialize once", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)

      await csvService.ensureInitialized()
      await csvService.ensureInitialized()

      expect(mockFs.mkdir).toHaveBeenCalledTimes(1)
    })

    it("should throw error if mkdir fails", async () => {
      const error = new Error("Permission denied")
      mockFs.mkdir.mockRejectedValue(error)

      await expect(csvService.ensureInitialized()).rejects.toThrow("Failed to initialize CSV service")
    })
  })

  describe("ensureFileExists", () => {
    it("should not create file if it already exists", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockResolvedValue(undefined)

      await csvService.ensureFileExists(testFilePath, testHeaders)

      expect(mockFs.access).toHaveBeenCalledWith(testFilePath)
      expect(mockFs.writeFile).not.toHaveBeenCalled()
    })

    it("should create file with headers if it doesn't exist", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockRejectedValue(new Error("File not found"))
      mockFs.writeFile.mockResolvedValue(undefined)

      await csvService.ensureFileExists(testFilePath, testHeaders)

      expect(mockFs.writeFile).toHaveBeenCalledWith(testFilePath, "id,name,email\n", "utf8")
    })
  })

  describe("readCsv", () => {
    it("should return empty array for empty file", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue("id,name,email\n")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([])
    })

    it("should return empty array for file with only headers", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue("id,name,email")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([])
    })

    it("should parse CSV data correctly", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue("id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([
        { id: "1", name: "John Doe", email: "john@example.com" },
        { id: "2", name: "Jane Smith", email: "jane@example.com" },
      ])
    })

    it("should handle missing values", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue("id,name,email\n1,John Doe,\n2,,jane@example.com")

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([
        { id: "1", name: "John Doe", email: "" },
        { id: "2", name: "", email: "jane@example.com" },
      ])
    })

    it("should return empty array on read error", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.readFile.mockRejectedValue(new Error("File not found"))

      const result = await csvService.readCsv(testFilePath)

      expect(result).toEqual([])
    })

    it("should support generic typing", async () => {
      interface TestRecord {
        id: string
        name: string
        email: string
      }

      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue("id,name,email\n1,John,john@test.com")

      const result = await csvService.readCsv<TestRecord>(testFilePath)

      expect(result).toEqual([{ id: "1", name: "John", email: "john@test.com" }])
    })
  })

  describe("writeCsv", () => {
    it("should write CSV data with headers", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      const data = [
        { id: "1", name: "John Doe", email: "john@example.com" },
        { id: "2", name: "Jane Smith", email: "jane@example.com" },
      ]

      await csvService.writeCsv(testFilePath, data, testHeaders)

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testFilePath,
        "id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com\n",
        "utf8",
      )
    })

    it("should handle empty data", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await csvService.writeCsv(testFilePath, [], testHeaders)

      expect(mockFs.writeFile).toHaveBeenCalledWith(testFilePath, "id,name,email\n", "utf8")
    })

    it("should handle missing values", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      const data = [{ id: "1", name: "John" }] // missing email

      await csvService.writeCsv(testFilePath, data, testHeaders)

      expect(mockFs.writeFile).toHaveBeenCalledWith(testFilePath, "id,name,email\n1,John,\n", "utf8")
    })
  })

  describe("appendToCsv", () => {
    it("should append record to existing file", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockResolvedValue(undefined) // File exists
      mockFs.appendFile.mockResolvedValue(undefined)

      const record = { id: "3", name: "Bob Wilson", email: "bob@example.com" }

      await csvService.appendToCsv(testFilePath, record, testHeaders)

      expect(mockFs.appendFile).toHaveBeenCalledWith(testFilePath, "3,Bob Wilson,bob@example.com\n", "utf8")
    })

    it("should create file with headers if it doesn't exist", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockRejectedValue(new Error("File not found"))
      mockFs.writeFile.mockResolvedValue(undefined)
      mockFs.appendFile.mockResolvedValue(undefined)

      const record = { id: "1", name: "John", email: "john@test.com" }

      await csvService.appendToCsv(testFilePath, record, testHeaders)

      expect(mockFs.writeFile).toHaveBeenCalledWith(testFilePath, "id,name,email\n", "utf8")
      expect(mockFs.appendFile).toHaveBeenCalledWith(testFilePath, "1,John,john@test.com\n", "utf8")
    })

    it("should escape CSV special characters", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockResolvedValue(undefined)
      mockFs.appendFile.mockResolvedValue(undefined)

      const record = {
        id: "1",
        name: 'John "Johnny" Doe',
        email: "john@example.com, backup@test.com",
      }

      await csvService.appendToCsv(testFilePath, record, testHeaders)

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        testFilePath,
        '1,"John ""Johnny"" Doe","john@example.com, backup@test.com"\n',
        "utf8",
      )
    })

    it("should handle newlines in data", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockResolvedValue(undefined)
      mockFs.appendFile.mockResolvedValue(undefined)

      const record = {
        id: "1",
        name: "John\nDoe",
        email: "john@example.com",
      }

      await csvService.appendToCsv(testFilePath, record, testHeaders)

      expect(mockFs.appendFile).toHaveBeenCalledWith(testFilePath, '1,"John\nDoe",john@example.com\n', "utf8")
    })

    it("should throw error on append failure", async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockResolvedValue(undefined)
      mockFs.appendFile.mockRejectedValue(new Error("Disk full"))

      const record = { id: "1", name: "John", email: "john@test.com" }

      await expect(csvService.appendToCsv(testFilePath, record, testHeaders)).rejects.toThrow("Disk full")
    })
  })

  describe("utility methods", () => {
    it("should return correct data directory", () => {
      expect(csvService.getDataDir()).toBe("./data")
    })

    it("should return correct file path", () => {
      const filename = "test.csv"
      const expectedPath = path.join("./data", filename)

      expect(csvService.getFilePath(filename)).toBe(expectedPath)
    })
  })

  describe("integration scenarios", () => {
    it("should handle complete workflow: create, write, read, append", async () => {
      // Setup mocks for complete workflow
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.access.mockRejectedValueOnce(new Error("File not found")) // First check
      mockFs.writeFile.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue("id,name,email\n1,John,john@test.com\n")
      mockFs.access.mockResolvedValue(undefined) // Second check for append
      mockFs.appendFile.mockResolvedValue(undefined)

      // Create and write initial data
      const initialData = [{ id: "1", name: "John", email: "john@test.com" }]
      await csvService.writeCsv(testFilePath, initialData, testHeaders)

      // Read data back
      const readData = await csvService.readCsv(testFilePath)
      expect(readData).toEqual(initialData)

      // Append new record
      const newRecord = { id: "2", name: "Jane", email: "jane@test.com" }
      await csvService.appendToCsv(testFilePath, newRecord, testHeaders)

      // Verify all operations were called
      expect(mockFs.mkdir).toHaveBeenCalled()
      expect(mockFs.writeFile).toHaveBeenCalled()
      expect(mockFs.readFile).toHaveBeenCalled()
      expect(mockFs.appendFile).toHaveBeenCalled()
    })
  })
})
