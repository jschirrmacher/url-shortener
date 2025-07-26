import fs from 'fs/promises'
import path from 'path'
import { createObjectCsvWriter } from 'csv-writer'
import csv from 'csv-parser'
import { createReadStream } from 'fs'

class CsvService {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data')
    this.urlsFile = path.join(this.dataDir, 'urls.csv')
    this.clicksFile = path.join(this.dataDir, 'clicks.csv')
    this.statsFile = path.join(this.dataDir, 'daily_stats.csv')
    this.initialized = false
  }

  async ensureInitialized() {
    if (this.initialized) return
    
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }

    // URLs CSV: shortCode,originalUrl,createdAt,createdBy,title
    if (!await this.fileExists(this.urlsFile)) {
      const urlsWriter = createObjectCsvWriter({
        path: this.urlsFile,
        header: [
          { id: 'shortCode', title: 'shortCode' },
          { id: 'originalUrl', title: 'originalUrl' },
          { id: 'createdAt', title: 'createdAt' },
          { id: 'createdBy', title: 'createdBy' },
          { id: 'title', title: 'title' }
        ]
      })
      await urlsWriter.writeRecords([])
    }

    // Clicks CSV: shortCode,timestamp,ip,userAgent,referrer,sourceType
    if (!await this.fileExists(this.clicksFile)) {
      const clicksWriter = createObjectCsvWriter({
        path: this.clicksFile,
        header: [
          { id: 'shortCode', title: 'shortCode' },
          { id: 'timestamp', title: 'timestamp' },
          { id: 'ip', title: 'ip' },
          { id: 'userAgent', title: 'userAgent' },
          { id: 'referrer', title: 'referrer' },
          { id: 'sourceType', title: 'sourceType' }
        ]
      })
      await clicksWriter.writeRecords([])
    }
    
    this.initialized = true
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async saveUrl(shortCode, originalUrl, createdBy = 'anonymous', title = '') {
    await this.ensureInitialized()
    
    const urlsWriter = createObjectCsvWriter({
      path: this.urlsFile,
      header: [
        { id: 'shortCode', title: 'shortCode' },
        { id: 'originalUrl', title: 'originalUrl' },
        { id: 'createdAt', title: 'createdAt' },
        { id: 'createdBy', title: 'createdBy' },
        { id: 'title', title: 'title' }
      ],
      append: true
    })

    const record = {
      shortCode,
      originalUrl,
      createdAt: new Date().toISOString(),
      createdBy,
      title: title || ''
    }

    await urlsWriter.writeRecords([record])
    return record
  }

  async getUrl(shortCode) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const results = []
      
      createReadStream(this.urlsFile)
        .pipe(csv())
        .on('data', (data) => {
          if (data.shortCode === shortCode) {
            results.push(data)
          }
        })
        .on('end', () => {
          resolve(results.length > 0 ? results[0] : null)
        })
        .on('error', reject)
    })
  }

  async saveClick(shortCode, ip, userAgent, referrer) {
    await this.ensureInitialized()
    
    const clicksWriter = createObjectCsvWriter({
      path: this.clicksFile,
      header: [
        { id: 'shortCode', title: 'shortCode' },
        { id: 'timestamp', title: 'timestamp' },
        { id: 'ip', title: 'ip' },
        { id: 'userAgent', title: 'userAgent' },
        { id: 'referrer', title: 'referrer' },
        { id: 'sourceType', title: 'sourceType' }
      ],
      append: true
    })

    const sourceType = this.determineSourceType(referrer, userAgent)
    
    const record = {
      shortCode,
      timestamp: new Date().toISOString(),
      ip,
      userAgent: userAgent || '',
      referrer: referrer || '',
      sourceType
    }

    await clicksWriter.writeRecords([record])
    return record
  }

  determineSourceType(referrer, userAgent) {
    if (!referrer || referrer === '') {
      // Kein Referrer - könnte E-Mail oder QR-Code sein
      if (userAgent && userAgent.includes('Mobile')) {
        return 'qr_code' // Mobile ohne Referrer = wahrscheinlich QR-Code
      }
      return 'email_or_direct' // Desktop ohne Referrer = E-Mail oder direkter Aufruf
    }
    
    // Mit Referrer = Website-Traffic
    return 'website'
  }

  async updateUrl(shortCode, newOriginalUrl, newTitle = null) {
    await this.ensureInitialized()
    
    // Lese alle URLs
    const allUrls = await new Promise((resolve, reject) => {
      const results = []
      
      createReadStream(this.urlsFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject)
    })

    // Finde und aktualisiere den Eintrag
    const urlIndex = allUrls.findIndex(url => url.shortCode === shortCode)
    if (urlIndex === -1) {
      throw new Error('Short Code nicht gefunden')
    }

    // Aktualisiere den Eintrag
    allUrls[urlIndex].originalUrl = newOriginalUrl
    allUrls[urlIndex].updatedAt = new Date().toISOString()
    
    // Aktualisiere Titel nur wenn explizit angegeben
    if (newTitle !== null) {
      allUrls[urlIndex].title = newTitle
    }

    // Schreibe alle URLs zurück
    const urlsWriter = createObjectCsvWriter({
      path: this.urlsFile,
      header: [
        { id: 'shortCode', title: 'shortCode' },
        { id: 'originalUrl', title: 'originalUrl' },
        { id: 'createdAt', title: 'createdAt' },
        { id: 'createdBy', title: 'createdBy' },
        { id: 'title', title: 'title' },
        { id: 'updatedAt', title: 'updatedAt' }
      ]
    })

    await urlsWriter.writeRecords(allUrls)
    
    return allUrls[urlIndex]
  }

  async getAllUrls() {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const results = []
      
      createReadStream(this.urlsFile)
        .pipe(csv())
        .on('data', (data) => {
          // Filtere leere Einträge (CSV-Header oder ungültige Daten)
          if (data.shortCode && 
              data.shortCode.trim() !== '' && 
              data.shortCode !== 'shortCode' && // Filtere CSV-Header
              data.originalUrl && 
              data.originalUrl.trim() !== '' &&
              data.originalUrl !== 'originalUrl') { // Filtere CSV-Header
            results.push(data)
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject)
    })
  }

  async getClickStats(shortCode) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const results = []
      
      createReadStream(this.clicksFile)
        .pipe(csv())
        .on('data', (data) => {
          if (data.shortCode === shortCode) {
            results.push(data)
          }
        })
        .on('end', () => {
          const stats = {
            totalClicks: results.length,
            sourceTypes: {},
            dailyClicks: {},
            referrers: {}
          }

          results.forEach(click => {
            // Source Types
            stats.sourceTypes[click.sourceType] = (stats.sourceTypes[click.sourceType] || 0) + 1
            
            // Daily Clicks
            const date = click.timestamp.split('T')[0]
            stats.dailyClicks[date] = (stats.dailyClicks[date] || 0) + 1
            
            // Referrers
            if (click.referrer) {
              stats.referrers[click.referrer] = (stats.referrers[click.referrer] || 0) + 1
            }
          })

          resolve(stats)
        })
        .on('error', reject)
    })
  }
}

export default new CsvService()
