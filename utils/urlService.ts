import { nanoid } from 'nanoid'
import csvService from './csvService'
import type { UrlRecord, UrlStats, UpdateUrlResponse, Click, ClickRecord } from '~/types/index'

// Import CsvRecord interface from csvService
interface CsvRecord {
  [key: string]: string | number | boolean
}

interface CreateUrlData {
  originalUrl: string
  customCode?: string
  title?: string
  createdBy: string
}

interface CreateUrlResult {
  shortCode: string
  shortUrl: string
  originalUrl: string
  title?: string
}

interface SourceTypeStats {
  [key: string]: number
}

interface DailyClickStats {
  [date: string]: number
}

interface ReferrerStats {
  [referrer: string]: number
}

class UrlService {
  private readonly baseUrl: string = process.env.BASE_URL || 'http://localhost:3000'

  async createShortUrl(data: CreateUrlData): Promise<CreateUrlResult> {
    const { originalUrl, customCode, title, createdBy } = data

    // Validiere URL
    if (!this.isValidUrl(originalUrl)) {
      throw new Error('Ungültige URL')
    }

    // Generiere oder verwende Custom Code
    let shortCode: string
    if (customCode) {
      // Prüfe ob Custom Code bereits existiert
      const existingUrl = await this.getUrlByShortCode(customCode)
      if (existingUrl) {
        throw new Error('Custom Code bereits vergeben')
      }
      shortCode = customCode
    } else {
      // Generiere eindeutigen Code
      shortCode = await this.generateUniqueShortCode()
    }

    // Speichere URL
    const urlRecord: UrlRecord = {
      shortCode,
      originalUrl,
      title,
      createdAt: new Date().toISOString(),
      createdBy,
    }

    await csvService.saveUrl(urlRecord)

    return {
      shortCode,
      shortUrl: `${this.baseUrl}/${shortCode}`,
      originalUrl,
      title,
    }
  }

  async getUrlByShortCode(shortCode: string): Promise<UrlRecord | null> {
    const urls = await csvService.getUrls()
    const url = urls.find(u => u.shortCode === shortCode)

    if (!url) {
      return null
    }

    return {
      shortCode: url.shortCode as string,
      originalUrl: url.originalUrl as string,
      title: url.title as string | undefined,
      createdAt: url.createdAt as string,
      createdBy: url.createdBy as string,
    }
  }

  async getUserUrls(username: string): Promise<UrlRecord[]> {
    const urls = await csvService.getUrls()
    return urls
      .filter(url => url.createdBy === username)
      .map(url => ({
        shortCode: url.shortCode as string,
        originalUrl: url.originalUrl as string,
        title: url.title as string | undefined,
        createdAt: url.createdAt as string,
        createdBy: url.createdBy as string,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async recordClick(
    shortCode: string,
    clickData: {
      ip: string
      userAgent: string
      referrer: string
    }
  ): Promise<void> {
    const sourceType = this.determineSourceType(clickData.referrer, clickData.userAgent)

    const click: CsvRecord = {
      shortCode,
      timestamp: new Date().toISOString(),
      ip: clickData.ip,
      userAgent: clickData.userAgent,
      referrer: clickData.referrer,
      sourceType,
    }

    await csvService.saveClick(click)
  }

  async getUrlStats(shortCode: string): Promise<UrlStats | null> {
    // Hole URL-Daten
    const url = await this.getUrlByShortCode(shortCode)
    if (!url) {
      return null
    }

    // Hole Click-Daten
    const clicks = await csvService.getClicks(shortCode)

    // Berechne Statistiken
    const totalClicks = clicks.length
    const uniqueClicks = this.calculateUniqueClicks(clicks)
    const sourceTypes = this.calculateSourceTypeStats(clicks)
    const dailyClicks = this.calculateDailyClickStats(clicks)
    const referrers = this.calculateReferrerStats(clicks)
    const recentClicks = this.getRecentClicks(clicks, 10) // Letzte 10 Klicks

    return {
      ...url,
      totalClicks,
      uniqueClicks,
      sourceTypes,
      dailyClicks,
      referrers,
      recentClicks,
    }
  }

  async updateUrl(
    shortCode: string,
    originalUrl: string,
    title?: string
  ): Promise<UpdateUrlResponse> {
    const existingUrl = await this.getUrlByShortCode(shortCode)
    if (!existingUrl) {
      throw new Error('URL nicht gefunden')
    }

    // Validiere neue URL
    if (!this.isValidUrl(originalUrl)) {
      throw new Error('Ungültige URL')
    }

    const previousUrl = existingUrl.originalUrl
    const updatedAt = new Date().toISOString()

    // Update URL
    await csvService.updateUrl(shortCode, {
      originalUrl,
      title: title ?? existingUrl.title,
    })

    return {
      shortCode,
      originalUrl,
      title,
      updatedAt,
      previousUrl,
      shortUrl: `${this.baseUrl}/${shortCode}`,
    }
  }

  async deleteUrl(shortCode: string): Promise<void> {
    await csvService.deleteUrl(shortCode)
  }

  // Private Helper Methods
  private async generateUniqueShortCode(): Promise<string> {
    let shortCode: string
    let attempts = 0
    const maxAttempts = 10

    do {
      shortCode = nanoid(6)
      attempts++

      if (attempts > maxAttempts) {
        throw new Error('Fehler beim Generieren eines eindeutigen Codes')
      }
    } while (await this.getUrlByShortCode(shortCode))

    return shortCode
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch (error: unknown) {
      return false
    }
  }

  private determineSourceType(
    referrer: string,
    userAgent: string
  ): 'website' | 'email' | 'qr' | 'direct' {
    // Kein Referrer = Direkt oder E-Mail/QR
    if (!referrer || referrer === '') {
      // Mobile User-Agent deutet auf QR-Code hin
      if (this.isMobileUserAgent(userAgent)) {
        return 'qr'
      }
      // Desktop ohne Referrer = E-Mail oder direkter Aufruf
      return 'email'
    }

    // Mit Referrer = Website-Traffic
    return 'website'
  }

  private isMobileUserAgent(userAgent: string): boolean {
    const mobileKeywords = [
      'Mobile',
      'Android',
      'iPhone',
      'iPad',
      'iPod',
      'BlackBerry',
      'Windows Phone',
    ]
    return mobileKeywords.some(keyword => userAgent.includes(keyword))
  }

  private calculateUniqueClicks(clicks: ClickRecord[]): number {
    const uniqueIps = new Set(clicks.map(click => click.ip))
    return uniqueIps.size
  }

  private getRecentClicks(
    clicks: ClickRecord[],
    limit: number = 10
  ): Array<{
    timestamp: string
    sourceType: string
    referrer: string
  }> {
    return clicks
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(click => ({
        timestamp: click.timestamp,
        sourceType: click.sourceType,
        referrer: click.referrer || 'Direkt',
      }))
  }

  private calculateSourceTypeStats(clicks: any[]): SourceTypeStats {
    const stats: SourceTypeStats = {}

    clicks.forEach(click => {
      const sourceType = click.sourceType as string
      stats[sourceType] = (stats[sourceType] ?? 0) + 1
    })

    return stats
  }

  private calculateDailyClickStats(clicks: any[]): DailyClickStats {
    const stats: DailyClickStats = {}

    clicks.forEach(click => {
      const date = new Date(click.timestamp as string).toISOString().split('T')[0]
      stats[date] = (stats[date] ?? 0) + 1
    })

    return stats
  }

  private calculateReferrerStats(clicks: any[]): ReferrerStats {
    const stats: ReferrerStats = {}

    clicks.forEach(click => {
      const referrer = (click.referrer as string) || 'Direct'
      stats[referrer] = (stats[referrer] ?? 0) + 1
    })

    return stats
  }
}

export default new UrlService()
