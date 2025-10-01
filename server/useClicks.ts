import useCsvService from "~/server/csvService"
import type { ClickRecord, SourceType, UrlStats, ClickData, DailyStats, DailyStatsEntry } from "~/types/index"

const CLICKS_FILE = "./data/clicks.csv"
const STATS_FILE = "./data/stats.csv"

async function recordClick(clickData: ClickData) {
  const timestamp = new Date().toISOString()

  const clickRecord = {
    shortCode: clickData.shortCode,
    timestamp,
    ip: clickData.ip,
    userAgent: clickData.userAgent,
    referrer: clickData.referrer,
    sourceType: clickData.sourceType,
  }

  const { appendToCsv } = useCsvService()
  await appendToCsv(CLICKS_FILE, clickRecord, ["shortCode", "timestamp", "ip", "userAgent", "referrer", "sourceType"])

  // Update daily stats
  await updateDailyStats(clickData.shortCode, clickData.ip)
}

async function getClicks(shortCode?: string) {
  const { readCsv } = useCsvService()
  const allClicks = (await readCsv(CLICKS_FILE)) as unknown as ClickRecord[]

  if (shortCode) {
    return allClicks.filter((click) => click.shortCode === shortCode)
  }

  return allClicks
}

// Fill missing days up to today with 0 values
function fillMissingDaysToToday(dailyStats: DailyStatsEntry[]): DailyStatsEntry[] {
  if (dailyStats.length === 0) {
    // If no data, create entry for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return [{
      date: today.toISOString().split('T')[0]!,
      clicks: 0,
      uniqueVisitors: 0
    }]
  }

  const result: DailyStatsEntry[] = []

  // Get newest date from data (first item since sorted newest first)
  const newestDataDate = new Date(dailyStats[0]!.date)
  
  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fill from newest data date to today (if newer than data)
  const currentDate = new Date(newestDataDate)
  currentDate.setDate(currentDate.getDate() + 1) // Start from day after newest data

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]!
    result.push({
      date: dateStr,
      clicks: 0,
      uniqueVisitors: 0
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Combine existing data with filled days, sort newest first
  return [...result, ...dailyStats].sort((a, b) => b.date.localeCompare(a.date))
}

async function getClickStats(shortCode: string, options?: { offset?: number; limit?: number }): Promise<Omit<UrlStats, 'url'>> {
  const clicks = await getClicks(shortCode)

  if (clicks.length === 0) {
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      dailyStats: [],
      topReferrers: [],
      sourceBreakdown: {},
      hasMore: false,
      _links: {
        self: { href: '' }, // Will be set by API handler
        first: { href: '' },
        url: { href: '' }
      }
    }
  }

  // Calculate unique visitors (from all clicks)
  const uniqueIps = new Set(clicks.map((click) => click.ip))

  // Group by date for daily stats
  const dailyClicksMap = clicks.reduce((map, click) => {
    const date = click.timestamp.split("T")[0]
    if (!date) return map
    
    if (!map.has(date)) {
      map.set(date, { clicks: 0, uniqueIps: new Set() })
    }
    const dayData = map.get(date)!
    dayData.clicks++
    dayData.uniqueIps.add(click.ip)
    return map
  }, new Map<string, { clicks: number; uniqueIps: Set<string> }>())

  // Sort daily stats by date (newest first)
  const allDailyStats = Array.from(dailyClicksMap.entries())
    .map(([date, data]) => ({
      date,
      clicks: data.clicks,
      uniqueVisitors: data.uniqueIps.size,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))

  // Fill missing days up to today
  const filledDailyStats = fillMissingDaysToToday(allDailyStats)

  // Apply pagination to daily stats
  const offset = options?.offset || 0
  const limit = options?.limit || 30
  const paginatedDailyStats = filledDailyStats.slice(offset, offset + limit)
  const hasMore = offset + limit < filledDailyStats.length

  // Top referrers (from all clicks)
  const referrerMap = new Map<string, number>()
  clicks.forEach((click) => {
    const referrer = click.referrer || "Direct"
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1)
  })

  const topReferrers = Array.from(referrerMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Source breakdown (from all clicks)
  const sourceMap = new Map<string, number>()
  clicks.forEach((click) => {
    sourceMap.set(click.sourceType, (sourceMap.get(click.sourceType) || 0) + 1)
  })

  const sourceBreakdown = Object.fromEntries(sourceMap)

  return {
    totalClicks: clicks.length,
    uniqueVisitors: uniqueIps.size,
    dailyStats: paginatedDailyStats,
    topReferrers,
    sourceBreakdown,
    hasMore,
    _links: {
      self: { href: '' }, // Will be set by API handler
      first: { href: '' },
      url: { href: '' }
    }
  }
}

async function updateDailyStats(shortCode: string, _ip: string) {
  const today = new Date().toISOString().split("T")[0]
  if (!today) return
  
  const { readCsv, writeCsv, appendToCsv } = useCsvService()
  const dailyStats = (await readCsv(STATS_FILE)) as unknown as DailyStats[]

  const existingStat = dailyStats.find((stat) => stat.date === today && stat.shortCode === shortCode)

  if (existingStat) {
    // Update existing stat
    const todayClicks = await getClicksForDate(shortCode, today)
    const uniqueIpsToday = new Set(todayClicks.map((click) => click.ip))

    const updatedStats = dailyStats.map((stat) => {
      if (stat.date === today && stat.shortCode === shortCode) {
        return {
          ...stat,
          clicks: todayClicks.length,
          uniqueIps: uniqueIpsToday.size,
        }
      }
      return stat
    })

    await writeCsv(STATS_FILE, updatedStats as DailyStats[], ["date", "shortCode", "clicks", "uniqueIps"])
  } else {
    // Create new stat
    const newStat = {
      date: today,
      shortCode,
      clicks: 1,
      uniqueIps: 1,
    }

    await appendToCsv(STATS_FILE, newStat, ["date", "shortCode", "clicks", "uniqueIps"])
  }
}

async function getClicksForDate(shortCode: string, date: string) {
  const allClicks = await getClicks(shortCode)
  return allClicks.filter((click) => click.timestamp.startsWith(date))
}

async function getDailyStats(shortCode?: string) {
  const { readCsv } = useCsvService()
  const allStats = (await readCsv(STATS_FILE)) as unknown as DailyStats[]

  if (shortCode) {
    return allStats.filter((stat) => stat.shortCode === shortCode)
  }

  return allStats
}

function determineSourceType(referrer: string, userAgent: string): SourceType {
  if (!referrer) {
    // Kein Referrer - prüfe User-Agent für Mobile/Desktop
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent)
    return isMobile ? "qr-code" : "direct"
  }

  // Hat Referrer - ist Website-Traffic
  return "website"
}

async function updateShortCodeInClicks(oldShortCode: string, newShortCode: string) {
  const { readCsv, writeCsv } = useCsvService()
  
  // Update clicks.csv
  const clicks = (await readCsv(CLICKS_FILE)) as unknown as ClickRecord[]
  const updatedClicks = clicks.map((click) => {
    if (click.shortCode === oldShortCode) {
      return { ...click, shortCode: newShortCode }
    }
    return click
  })
  
  if (updatedClicks.length > 0) {
    await writeCsv(CLICKS_FILE, updatedClicks as ClickRecord[], ["shortCode", "timestamp", "ip", "userAgent", "referrer", "sourceType"])
  }
  
  // Update stats.csv
  const stats = (await readCsv(STATS_FILE)) as unknown as DailyStats[]
  const updatedStats = stats.map((stat) => {
    if (stat.shortCode === oldShortCode) {
      return { ...stat, shortCode: newShortCode }
    }
    return stat
  })
  
  if (updatedStats.length > 0) {
    await writeCsv(STATS_FILE, updatedStats as DailyStats[], ["date", "shortCode", "clicks", "uniqueIps"])
  }
}

export default function useClicks() {
  return {
    recordClick,
    getClicks,
    getClickStats,
    updateDailyStats,
    getClicksForDate,
    getDailyStats,
    determineSourceType,
    updateShortCodeInClicks,
  }
}
