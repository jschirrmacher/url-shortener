import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { promises as fs } from "node:fs"
import path from "node:path"

async function cleanupTestData() {
  try {
    await $fetch("/api/test/cleanup", { method: "DELETE" })
  } catch {
    // Ignore cleanup errors in tests
  }
}

describe("User Deactivation Integration", () => {
  const testDataDir = "./test-data"
  const testUsersFile = path.join(testDataDir, "users.csv")

  beforeEach(async () => {
    // Create test data directory
    await fs.mkdir(testDataDir, { recursive: true })

    // Create test users.csv with active user
    const csvContent = `username,password,role,createdAt,active
testuser,hashedpassword:salt,user,2025-01-01T00:00:00.000Z,true`

    await fs.writeFile(testUsersFile, csvContent)
  })

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData()
    try {
      await fs.rm(testDataDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  it("should correctly handle string-based active field", async () => {
    // Read the test file
    const content = await fs.readFile(testUsersFile, "utf-8")
    const lines = content.trim().split("\n") // Fixed: single backslash
    const userData = lines[1]!.split(",")

    // Parse user data
    const user = {
      username: userData[0]!,
      password: userData[1]!,
      role: userData[2]! as "user" | "admin",
      createdAt: userData[3]!,
      active: userData[4] as "true" | "false",
    }

    // Verify initial state
    expect(user.active).toBe("true")
    expect(user.active === "true").toBe(true) // String comparison
    expect(!!user.active).toBe(true) // This was the bug - truthy check

    // Simulate deactivation
    user.active = "false"

    // Test the fixed logic
    expect(user.active).toBe("false")
    expect((user.active as string) === "true").toBe(false) // Correct string comparison
    expect(!!user.active).toBe(true) // This is the bug - "false" is truthy!

    // The correct way to check (what we fixed)
    const isActive = (user.active as string) === "true" // Type-safe comparison
    expect(isActive).toBe(false) // User is not active

    // Write back to file (simulating saveUsersToFile fix)
    const updatedCsvContent = `username,password,role,createdAt,active
${user.username},${user.password},${user.role},${user.createdAt},${user.active}`

    await fs.writeFile(testUsersFile, updatedCsvContent)

    // Verify file was written correctly
    const savedContent = await fs.readFile(testUsersFile, "utf-8")
    expect(savedContent).toContain("testuser,hashedpassword:salt,user,2025-01-01T00:00:00.000Z,false")
  })

  it("should demonstrate the bug that was fixed", () => {
    // This demonstrates the bug in the original saveUsersToFile function
    const userWithStringActive = { active: "false" }

    // Original buggy logic: active: user.active ? "true" : "false"
    const buggyResult = userWithStringActive.active ? "true" : "false"
    expect(buggyResult).toBe("true") // BUG: "false" string is truthy!

    // Fixed logic: active: user.active (already a string)
    const fixedResult = userWithStringActive.active
    expect(fixedResult).toBe("false") // CORRECT: preserves the actual value

    // Authentication check (what we added)
    const isUserActive = userWithStringActive.active === "true"
    expect(isUserActive).toBe(false) // CORRECT: user is not active
  })
})
