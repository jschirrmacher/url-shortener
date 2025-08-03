import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import useUsers from "~/server/useUsers"

function createUserData(username: string, role: "admin" | "user" = "user") {
  return { username, password: "oldpass123", role }
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

  afterEach(() => {
    cleanupTestEnvironment(testDataDir)
  })

  describe("Admin Password Management", () => {
    it("should allow admin to change password without current password verification", async () => {
      const users = useUsers()
      const username = `admin_${Date.now()}`
      const userData = createUserData(username, "admin")

      const adminUser = await users.createUser(userData)
      expect(adminUser.username).toBe(username)
      expect(adminUser.role).toBe("admin")

      const newPassword = "newpass123"
      await expect(users.changePassword(username, newPassword, true)).resolves.toBeUndefined()

      await verifyPasswordChange(users, username, userData.password, newPassword)
    })

    it("should allow admin to change password with current password verification", async () => {
      const users = useUsers()
      const username = `admin_${Date.now()}_2`
      const userData = createUserData(username, "admin")

      await users.createUser(userData)

      const newPassword = "newpass123"
      await expect(users.changePassword(username, newPassword, true, userData.password)).resolves.toBeUndefined()

      await verifyPasswordChange(users, username, userData.password, newPassword)
    })
  })

  describe("Regular User Password Management", () => {
    it("should enforce current password requirement for regular users", async () => {
      const users = useUsers()
      const username = `user_${Date.now()}`
      const userData = createUserData(username, "user")

      await users.createUser(userData)

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
      const users = useUsers()
      const username = `testuser_${Date.now()}`
      const userData = createUserData(username, "user")

      await users.createUser(userData)

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
