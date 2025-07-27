import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { promisify } from 'util'
import csvService from './csvService'
import type { User, AuthUser } from '~/types/index'

// Promisify crypto.scrypt für async/await
const scrypt = promisify(crypto.scrypt)

interface CreateUserData {
  username: string
  password: string
  role?: 'admin' | 'user'
}

interface LoginResult {
  success: boolean
  user?: User
  token?: string
  message?: string
}

class AuthService {
  private readonly jwtSecret: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
  private readonly jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
  private readonly usersFile: string = './data/users.csv'
  private readonly saltLength = 32
  private readonly keyLength = 64

  // Hash password mit crypto.scrypt
  private async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(this.saltLength)
    const derivedKey = await scrypt(password, salt, this.keyLength) as Buffer
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`
  }

  // Verify password mit crypto.scrypt
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [saltHex, keyHex] = hashedPassword.split(':')
    if (!saltHex || !keyHex) {
      return false
    }
    const salt = Buffer.from(saltHex, 'hex')
    const key = Buffer.from(keyHex, 'hex')
    const derivedKey = await scrypt(password, salt, this.keyLength) as Buffer
    return crypto.timingSafeEqual(key, derivedKey)
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const { username, password, role = 'user' } = userData

    // Prüfe ob Benutzer bereits existiert
    const existingUser = await this.getUser(username)
    if (existingUser) {
      throw new Error('Benutzername bereits vergeben')
    }

    // Hash Passwort
    const hashedPassword = await this.hashPassword(password)

    const newUser: User = {
      username,
      role,
      createdAt: new Date().toISOString()
    }

    // Speichere in CSV (mit gehashtem Passwort)
    const csvData = {
      username,
      password: hashedPassword,
      role,
      createdAt: newUser.createdAt,
      active: 'true'
    }

    await csvService.appendToCsv(this.usersFile, csvData, [
      'username', 'password', 'role', 'createdAt', 'active'
    ])

    return newUser
  }

  async authenticateUser(username: string, password: string): Promise<LoginResult> {
    try {
      const users = await csvService.readCsv(this.usersFile)
      const userRecord = users.find((u: any) => u.username === username && u.active === 'true')

      if (!userRecord) {
        return { success: false, message: 'Ungültige Anmeldedaten' }
      }

      const isValidPassword = await this.verifyPassword(password, userRecord.password as string)
      if (!isValidPassword) {
        return { success: false, message: 'Ungültige Anmeldedaten' }
      }

      const user: User = {
        username: userRecord.username as string,
        role: userRecord.role as 'admin' | 'user',
        createdAt: userRecord.createdAt as string
      }

      const token = this.generateToken(user)

      return {
        success: true,
        user,
        token
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error)
      return { success: false, message: 'Authentifizierung fehlgeschlagen' }
    }
  }

  generateToken(user: User): string {
    const payload: AuthUser = {
      username: user.username,
      userId: user.username, // Verwende username als userId
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 Stunden
    }

    return jwt.sign(payload, this.jwtSecret)
  }

  verifyToken(token: string): AuthUser {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthUser
    } catch (error: unknown) {
      throw new Error('Ungültiger Token')
    }
  }

  async getUser(username: string): Promise<User | null> {
    try {
      const users = await csvService.readCsv(this.usersFile)
      const userRecord = users.find((u: any) => u.username === username && u.active === 'true')

      if (!userRecord) {
        return null
      }

      return {
        username: userRecord.username as string,
        role: userRecord.role as 'admin' | 'user',
        createdAt: userRecord.createdAt as string
      }
    } catch (error: unknown) {
      console.error('Get user error:', error)
      return null
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await csvService.readCsv(this.usersFile)
      return users
        .filter((u: any) => u.active === 'true')
        .map((u: any) => ({
          username: u.username as string,
          role: u.role as 'admin' | 'user',
          createdAt: u.createdAt as string
        }))
    } catch (error: unknown) {
      console.error('Get all users error:', error)
      return []
    }
  }

  async changePassword(username: string, currentPassword: string, newPassword: string): Promise<void> {
    const users = await csvService.readCsv(this.usersFile)
    const userIndex = users.findIndex((u: any) => u.username === username && u.active === 'true')

    if (userIndex === -1) {
      throw new Error('Benutzer nicht gefunden')
    }

    const user = users[userIndex]
    const isValidPassword = await this.verifyPassword(currentPassword, user.password as string)
    
    if (!isValidPassword) {
      throw new Error('Aktuelles Passwort ist falsch')
    }

    // Hash neues Passwort
    const hashedNewPassword = await this.hashPassword(newPassword)
    users[userIndex].password = hashedNewPassword

    await csvService.writeCsv(this.usersFile, users, [
      'username', 'password', 'role', 'createdAt', 'active'
    ])
  }

  async updateUserRole(username: string, newRole: 'admin' | 'user'): Promise<void> {
    const users = await csvService.readCsv(this.usersFile)
    const userIndex = users.findIndex((u: any) => u.username === username && u.active === 'true')

    if (userIndex === -1) {
      throw new Error('Benutzer nicht gefunden')
    }

    users[userIndex].role = newRole

    await csvService.writeCsv(this.usersFile, users, [
      'username', 'password', 'role', 'createdAt', 'active'
    ])
  }

  async deactivateUser(username: string): Promise<void> {
    const users = await csvService.readCsv(this.usersFile)
    const userIndex = users.findIndex((u: any) => u.username === username)

    if (userIndex === -1) {
      throw new Error('Benutzer nicht gefunden')
    }

    users[userIndex].active = 'false'

    await csvService.writeCsv(this.usersFile, users, [
      'username', 'password', 'role', 'createdAt', 'active'
    ])
  }

  async reactivateUser(username: string): Promise<void> {
    const users = await csvService.readCsv(this.usersFile)
    const userIndex = users.findIndex((u: any) => u.username === username)

    if (userIndex === -1) {
      throw new Error('Benutzer nicht gefunden')
    }

    users[userIndex].active = 'true'

    await csvService.writeCsv(this.usersFile, users, [
      'username', 'password', 'role', 'createdAt', 'active'
    ])
  }
}

export default new AuthService()
