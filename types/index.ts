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

export type SourceType = "website" | "direct" | "qr-code"

export interface CreateUrlResult {
  shortCode: string
  originalUrl: string
  title?: string
  shortUrl: string
}

export interface UrlStats {
  url: UrlRecord
  totalClicks: number
  uniqueVisitors: number
  dailyStats: Array<{
    date: string
    clicks: number
    uniqueVisitors: number
  }>
  topReferrers: Array<{
    referrer: string
    count: number
  }>
  sourceBreakdown: Record<string, number>
}

export interface UpdateUrlRequest {
  originalUrl: string
  title?: string
}

export interface UpdateUrlResponse {
  success: boolean
  message: string
  url: UrlRecord
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
