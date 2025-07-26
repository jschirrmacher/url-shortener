export interface UrlRecord {
  shortCode: string
  originalUrl: string
  createdAt: string
  createdBy: string
}

export interface ClickRecord {
  shortCode: string
  timestamp: string
  ip: string
  userAgent: string
  referrer: string
  sourceType: SourceType
}

export type SourceType = 'website' | 'email_or_direct' | 'qr_code'

export interface UrlStats {
  shortCode: string
  originalUrl: string
  createdAt: string
  totalClicks: number
  sourceTypes: Record<SourceType, number>
  dailyClicks: Record<string, number>
  referrers: Record<string, number>
}

export interface CreateUrlRequest {
  originalUrl: string
  customCode?: string
}

export interface CreateUrlResponse {
  shortCode: string
  originalUrl: string
  shortUrl: string
  createdAt: string
}

export interface ApiError {
  message: string
  statusCode: number
}
