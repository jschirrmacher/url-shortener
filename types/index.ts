// Gemeinsame TypeScript-Typen für URL-Shortener

export interface User {
  username: string
  role: "admin" | "user"
  createdAt: string
  active: boolean
}

export type UrlRecord = {
  shortCode: string
  originalUrl: string
  title?: string
  createdAt: string
  createdBy: string
  totalClicks?: number
}

export interface ClickRecord {
  shortCode: string
  timestamp: string
  ip: string
  userAgent: string
  referrer: string
  sourceType: string
}

export interface UrlStats extends UrlRecord {
  totalClicks: number
  uniqueClicks: number
  sourceTypes: Record<string, number>
  dailyClicks: Record<string, number>
  referrers: Record<string, number>
  recentClicks: Array<{
    timestamp: string
    sourceType: string
    referrer: string
  }>
}

export interface UpdateUrlRequest {
  originalUrl: string
  title?: string
}

export interface UpdateUrlResponse {
  shortCode: string
  originalUrl: string
  title?: string
  updatedAt: string
  previousUrl: string
  shortUrl: string
  message?: string
}

export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: {
    message?: string
  }
  message?: string
}

export interface AuthUser {
  username: string
  userId: string
  iat: number
  exp: number
}

export interface Click {
  shortCode: string
  timestamp: string
  ip: string
  userAgent: string
  referrer: string
  sourceType: "website" | "email" | "qr" | "direct"
}
