import { nanoid } from 'nanoid'
import csvService from './csvService.js'

class UrlService {
  constructor() {
    this.shortCodeLength = 6 // 6 Zeichen = ~56 Milliarden mögliche Kombinationen
  }

  async createShortUrl(originalUrl, customCode) {
    // Validiere URL
    if (!this.isValidUrl(originalUrl)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ungültige URL'
      })
    }

    let shortCode
    
    if (customCode) {
      // Prüfe ob Custom Code bereits existiert
      const existing = await csvService.getUrl(customCode)
      if (existing) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Custom Code bereits vergeben'
        })
      }
      shortCode = customCode
    } else {
      // Generiere eindeutigen Short Code
      do {
        shortCode = nanoid(this.shortCodeLength)
      } while (await csvService.getUrl(shortCode))
    }

    // Speichere URL
    const urlRecord = await csvService.saveUrl(shortCode, originalUrl)
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    
    return {
      shortCode,
      originalUrl,
      shortUrl: `${baseUrl}/${shortCode}`,
      createdAt: urlRecord.createdAt
    }
  }

  async getOriginalUrl(shortCode) {
    const urlRecord = await csvService.getUrl(shortCode)
    return urlRecord ? urlRecord.originalUrl : null
  }

  async trackClick(shortCode, event) {
    const ip = this.getClientIp(event)
    const headers = event.node?.req?.headers || {}
    const userAgent = headers['user-agent'] || ''
    const referrer = headers['referer'] || ''

    await csvService.saveClick(shortCode, ip, userAgent, referrer)
  }

  async getUrlStats(shortCode) {
    const urlRecord = await csvService.getUrl(shortCode)
    if (!urlRecord) {
      return null
    }

    const clickStats = await csvService.getClickStats(shortCode)
    
    return {
      shortCode,
      originalUrl: urlRecord.originalUrl,
      createdAt: urlRecord.createdAt,
      ...clickStats
    }
  }

  async updateUrl(shortCode, newOriginalUrl) {
    // Validiere neue URL
    if (!this.isValidUrl(newOriginalUrl)) {
      const error = new Error('Ungültige URL')
      error.statusCode = 400
      throw error
    }

    // Prüfe ob Short Code existiert
    const existingUrl = await csvService.getUrl(shortCode)
    if (!existingUrl) {
      const error = new Error('Short Code nicht gefunden')
      error.statusCode = 404
      throw error
    }

    // Update URL in CSV
    const updatedRecord = await csvService.updateUrl(shortCode, newOriginalUrl)
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    
    return {
      shortCode,
      originalUrl: newOriginalUrl,
      shortUrl: `${baseUrl}/${shortCode}`,
      updatedAt: updatedRecord.updatedAt,
      previousUrl: existingUrl.originalUrl
    }
  }

  isValidUrl(string) {
    try {
      const url = new URL(string)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  getClientIp(event) {
    // Versuche verschiedene Header für die IP-Adresse
    const headers = event.node?.req?.headers || {}
    
    const forwarded = headers['x-forwarded-for']
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    const realIp = headers['x-real-ip']
    if (realIp) {
      return realIp
    }
    
    // Fallback
    return event.node?.req?.socket?.remoteAddress || 'unknown'
  }
}

export default new UrlService()
