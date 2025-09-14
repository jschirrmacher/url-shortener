import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import useUsers from "~/server/useUsers"

const createdUsers: string[] = []

function createUserData(username: string, role: "admin" | "user" = "user") {
  return { username, password: "oldpass123", role }
}

async function createTestUser(username: string, role: "admin" | "user" = "user") {
  const users = useUsers()
  const userData = createUserData(username, role)
  const user = await users.createUser(userData)
  createdUsers.push(username)
  return { user, userData }
}

async function cleanupUsers() {
  const users = useUsers()
  for (const username of createdUsers) {
    try {
      await users.deleteUser(username)
    } catch {
      // User might already be deleted, ignore error
    }
  }
  createdUsers.length = 0
}

function setupTestEnvironment(testDataDir: string) {
  if (existsSync(testDataDir)) {
    rmSync(testDataDir, { recursive: true, force: true })
  }

  mkdirSync(testDataDir, { recursive: true })
  process.env.DATA_DIR = testDataDir
}

function cleanupTestEnvironment(testDataDir: string) {
  if (existsSync(testDataDir)) {
    rmSync(testDataDir, { recursive: true, force: true })
  }
  delete process.env.DATA_DIR
}

async function verifyPasswordChange(
  users: ReturnType<typeof useUsers>,
  username: string,
  oldPassword: string,
  newPassword: string,
) {
  const oldAuthResult = await users.authenticateUser(username, oldPassword)
  expect(oldAuthResult.success).toBe(false)

  const newAuthResult = await users.authenticateUser(username, newPassword)
  expect(newAuthResult.success).toBe(true)
  expect(newAuthResult.user?.username).toBe(username)
}

describe("Password Change Integration", () => {
  let testDataDir: string

  beforeEach(() => {
    testDataDir = join(process.cwd(), `test-data-${Math.random().toString(36).substring(7)}`)
    setupTestEnvironment(testDataDir)
  })

  afterEach(async () => {
    // Ensure we're in the test environment before cleanup
    const currentDataDir = process.env.DATA_DIR
    if (currentDataDir === testDataDir) {
      await cleanupUsers()
    }
    cleanupTestEnvironment(testDataDir)
  })

  describe("Admin Password Management", () => {
    it("should allow admin to change password without current password verification", async () => {
      const username = `admin_${Date.now()}`
      const { user, userData } = await createTestUser(username, "admin")

      expect(user.username).toBe(username)
      expect(user.role).toBe("admin")

      const users = useUsers()
      const newPassword = "newpass123"
      await expect(users.changePassword(username, newPassword, true)).resolves.toBeUndefined()

      await verifyPasswordChange(users, username, userData.password, newPassword)
    })

    it("should allow admin to change password with current password verification", async () => {
      const username = `admin_${Date.now()}_2`
      const { userData } = await createTestUser(username, "admin")

      const users = useUsers()
      const newPassword = "newpass123"
      await expect(users.changePassword(username, newPassword, true, userData.password)).resolves.toBeUndefined()

      await verifyPasswordChange(users, username, userData.password, newPassword)
    })
  })

  describe("Regular User Password Management", () => {
    it("should enforce current password requirement for regular users", async () => {
      const username = `user_${Date.now()}`
      const { userData } = await createTestUser(username, "user")

      const users = useUsers()
      const newPassword = "newpass123"

      await expect(users.changePassword(username, newPassword, false)).rejects.toThrow(
        "Current password is incorrect or not provided",
      )

      await expect(users.changePassword(username, newPassword, false, "wrongpass")).rejects.toThrow(
        "Current password is incorrect or not provided",
      )

      await expect(users.changePassword(username, newPassword, false, userData.password)).resolves.toBeUndefined()

      await verifyPasswordChange(users, username, userData.password, newPassword)
    })
  })

  describe("Error Handling", () => {
    it("should handle non-existent user gracefully", async () => {
      const users = useUsers()

      await expect(users.changePassword("nonexistent", "newpass123", false, "oldpass")).rejects.toThrow()
    })
  })

  describe("Security Validation", () => {
    it("should properly hash passwords and maintain security", async () => {
      const username = `testuser_${Date.now()}`
      const { userData } = await createTestUser(username, "user")

      const users = useUsers()
      const newPassword = "newpass123"
      await users.changePassword(username, newPassword, false, userData.password)

      await verifyPasswordChange(users, username, userData.password, newPassword)

      const userRecord = await users.getUser(username)
      expect(userRecord).toBeTruthy()
      expect(userRecord?.username).toBe(username)
      expect(userRecord?.role).toBe("user")
      expect(userRecord?.active).toBe(true)
    })
  })
})
