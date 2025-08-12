import jwt from "jsonwebtoken"
import crypto from "node:crypto"
import { promisify } from "node:util"
import useCsvService from "~/server/csvService"
import type { User, AuthUser } from "~/types/index"

const scrypt = promisify(crypto.scrypt)

interface CreateUserData {
  username: string
  password: string
  role?: "admin" | "user"
}

interface UserRecord {
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
  active: "true" | "false"
  [key: string]: string
}

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const USERS_FILE = "./data/users.csv"
const SALT_LENGTH = 32
const KEY_LENGTH = 64

let users: UserRecord[] = []
let initialized = false

async function initializeUsers() {
  if (initialized) return

  try {
    const { readCsv } = useCsvService()
    users = await readCsv<UserRecord>(USERS_FILE)
    initialized = true
  } catch (error) {
     
    console.error("Failed to initialize users:", error)
    users = []
    initialized = true
  }
}

async function saveUsersToFile() {
  const { writeCsv } = useCsvService()
  await writeCsv(USERS_FILE, users, ["username", "password", "role", "createdAt", "active"])
}

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`
}

async function verifyPassword(password: string, hashedPassword: string) {
  const [saltHex, keyHex] = hashedPassword.split(":")
  if (!saltHex || !keyHex) {
    return false
  }
  const salt = Buffer.from(saltHex, "hex")
  const key = Buffer.from(keyHex, "hex")
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return crypto.timingSafeEqual(key, derivedKey)
}

function generateToken(user: UserRecord) {
  const payload: AuthUser = {
    username: user.username,
    userId: user.username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  }

  return jwt.sign(payload, JWT_SECRET)
}

async function createUser(userData: CreateUserData) {
  const user = await getUserRecord(userData.username, false)

  if (user) {
    throw new Error("Username already taken")
  }

  const { username, password, role = "user" } = userData
  const newUserRecord: UserRecord = {
    username,
    password: await hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
    active: "true",
  }

  users.push(newUserRecord)
  await saveUsersToFile()

  return mapUserRecord(newUserRecord)
}

async function authenticateUser(username: string, password: string) {
  try {
    const user = await getUserRecord(username, false)

    if (!user) {
      return { success: false, message: "Invalid credentials" }
    }

    if (user.active !== "true") {
      return { success: false, message: "Account is deactivated" }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, message: "Invalid credentials" }
    }

    const token = generateToken(user)

    return {
      success: true,
      user: mapUserRecord(user),
      token,
    }
  } catch {
    return { success: false, message: "Authentication failed" }
  }
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    throw new Error("Invalid token")
  }
}

function mapUserRecord(user: UserRecord): User {
  return {
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    active: user.active === "true",
  }
}

async function getUser(username: string) {
  const user = await getUserRecord(username, false)

  return user ? mapUserRecord(user) : null
}

async function getAllUsers() {
  await initializeUsers()
  return users.map(mapUserRecord)
}

async function changePassword(username: string, newPassword: string, isAdmin = false, currentPassword?: string) {
  const user = await getUserRecord(username)

  if (!isAdmin && (!currentPassword || !(await verifyPassword(currentPassword, user!.password)))) {
    throw new Error("Current password is incorrect or not provided")
  }

  user!.password = await hashPassword(newPassword)
  await saveUsersToFile()
}

async function updateUserRole(username: string, newRole: "admin" | "user") {
  const user = await getUserRecord(username)
  user!.role = newRole
  await saveUsersToFile()
}

async function deactivateUser(username: string) {
  const user = await getUserRecord(username)
  user!.active = "false"
  await saveUsersToFile()
}

async function reactivateUser(username: string) {
  const user = await getUserRecord(username)
  user!.active = "true"
  await saveUsersToFile()
}

async function getUserRecord(username: string, failOnNotFound = true) {
  await initializeUsers()
  const user = users.find((u) => u.username === username)
  if (!user && failOnNotFound) {
    throw new Error("User not found")
  }
  return user
}

export default function useUsers() {
  return {
    createUser,
    authenticateUser,
    verifyToken,
    getUser,
    getAllUsers,
    changePassword,
    updateUserRole,
    deactivateUser,
    reactivateUser,
  }
}
