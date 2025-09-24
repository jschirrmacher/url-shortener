import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

interface DemoUrl {
  shortCode: string
  originalUrl: string
  title: string
  createdBy: string
}

interface ClickData {
  shortCode: string
  timestamp: string
  ip: string
  userAgent: string
  referrer: string
  sourceType: string
}

const DATA_DIR = join(process.cwd(), 'data')
const CLICKS_FILE = join(DATA_DIR, 'clicks.csv')
const URLS_FILE = join(DATA_DIR, 'urls.csv')

// Demo URLs to generate data for
const demoUrls: DemoUrl[] = [
  { shortCode: 'demo1', originalUrl: 'https://example.com', title: 'Example Site', createdBy: 'admin' },
  { shortCode: 'demo2', originalUrl: 'https://github.com', title: 'GitHub', createdBy: 'admin' },
  { shortCode: 'demo3', originalUrl: 'https://stackoverflow.com', title: 'Stack Overflow', createdBy: 'admin' }
]

// Referrers for realistic data
const referrers: string[] = [
  'https://google.com',
  'https://twitter.com', 
  'https://facebook.com',
  'https://linkedin.com',
  'https://reddit.com',
  '', // Direct traffic
  '', // Direct traffic (more common)
  ''  // Direct traffic (most common)
]

// User agents
const userAgents: string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
]

function generateRandomIP(): string {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

function generateClicksForDate(date: string, shortCode: string, clickCount: number): ClickData[] {
  const clicks: ClickData[] = []
  
  for (let i = 0; i < clickCount; i++) {
    // Random time during the day
    const hour = Math.floor(Math.random() * 24)
    const minute = Math.floor(Math.random() * 60)
    const second = Math.floor(Math.random() * 60)
    
    const timestamp = `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}.000Z`
    
    const referrer = getRandomElement(referrers)
    const sourceType = referrer ? 'website' : getRandomElement(['email', 'qr-code'])
    
    clicks.push({
      shortCode,
      timestamp,
      ip: generateRandomIP(),
      userAgent: getRandomElement(userAgents),
      referrer,
      sourceType
    })
  }
  
  return clicks
}

function generateDemoData(): void {
  console.log('🎲 Generiere Demo-Daten für die letzten 2 Monate...')
  
  // Create data directory if it doesn't exist
  if (!existsSync(DATA_DIR)) {
    console.log('📁 Erstelle data/ Verzeichnis...')
    mkdirSync(DATA_DIR, { recursive: true })
  }
  
  // Generate URLs if they don't exist
  let existingUrls: string[] = []
  if (existsSync(URLS_FILE)) {
    const urlsContent = readFileSync(URLS_FILE, 'utf-8')
    const lines = urlsContent.trim().split('\n')
    if (lines.length > 1) { // Skip header
      existingUrls = lines.slice(1).map(line => {
        const [shortCode] = line.split(',')
        return shortCode!
      })
    }
  }
  
  // Add demo URLs if they don't exist
  const urlsToAdd = demoUrls.filter(url => !existingUrls.includes(url.shortCode))
  if (urlsToAdd.length > 0) {
    console.log(`📝 Füge ${urlsToAdd.length} Demo-URLs hinzu...`)
    
    let urlsCsv = 'shortCode,originalUrl,title,createdAt,createdBy\n'
    
    // Add existing URLs
    if (existsSync(URLS_FILE)) {
      const existingContent = readFileSync(URLS_FILE, 'utf-8')
      const lines = existingContent.trim().split('\n')
      if (lines.length > 1) {
        urlsCsv = existingContent.trim() + '\n'
      }
    }
    
    // Add new URLs
    urlsToAdd.forEach(url => {
      const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() // Last 60 days
      urlsCsv += `${url.shortCode},"${url.originalUrl}","${url.title}",${createdAt},${url.createdBy}\n`
    })
    
    writeFileSync(URLS_FILE, urlsCsv)
  }
  
  // Generate clicks for last 60 days
  console.log('📊 Generiere Klick-Daten...')
  
  let clicksCsv = 'shortCode,timestamp,ip,userAgent,referrer,sourceType\n'
  
  // Keep existing clicks
  if (existsSync(CLICKS_FILE)) {
    const existingContent = readFileSync(CLICKS_FILE, 'utf-8')
    const lines = existingContent.trim().split('\n')
    if (lines.length > 1) {
      clicksCsv = existingContent.trim() + '\n'
    }
  }
  
  const today = new Date()
  const allClicks: ClickData[] = []
  
  // Generate data for last 60 days
  for (let i = 0; i < 60; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]!
    
    demoUrls.forEach(url => {
      // More clicks for recent days, fewer for older days
      const baseClicks = Math.max(1, Math.floor(Math.random() * 20) - i * 0.2)
      const clickCount = Math.max(0, Math.floor(baseClicks + Math.random() * 10))
      
      if (clickCount > 0) {
        const dayClicks = generateClicksForDate(dateStr, url.shortCode, clickCount)
        allClicks.push(...dayClicks)
      }
    })
  }
  
  // Sort clicks by timestamp
  allClicks.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  
  // Add to CSV
  allClicks.forEach(click => {
    clicksCsv += `${click.shortCode},${click.timestamp},${click.ip},"${click.userAgent}","${click.referrer}",${click.sourceType}\n`
  })
  
  writeFileSync(CLICKS_FILE, clicksCsv)
  
  console.log(`✅ Demo-Daten generiert:`)
  console.log(`   📝 ${demoUrls.length} URLs`)
  console.log(`   📊 ${allClicks.length} Klicks über 60 Tage`)
  console.log(`   📁 Gespeichert in: ${DATA_DIR}`)
}

// Run the generator
generateDemoData()
