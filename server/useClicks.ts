import useCsvService from "~/server/csvService"
import type { ClickRecord, SourceType } from "~/types/index"

interface ClickData {
  shortCode: string
  ip: string
  userAgent: string
  referrer: string
  sourceType: SourceType
}

interface DailyStats {
  date: string
  shortCode: string
  clicks: number
  uniqueIps: number
  [key: string]: string | number | boolean
}

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

async function getClickStats(shortCode: string) {
  const clicks = await getClicks(shortCode)

  if (clicks.length === 0) {
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      dailyStats: [],
      topReferrers: [],
      sourceBreakdown: {},
    }
  }

  // Calculate unique visitors
  const uniqueIps = new Set(clicks.map((click) => click.ip))

  // Group by date for daily stats
  const dailyClicksMap = new Map<string, { clicks: number; uniqueIps: Set<string> }>()

  clicks.forEach((click) => {
    const date = click.timestamp.split("T")[0]
    if (!dailyClicksMap.has(date)) {
      dailyClicksMap.set(date, { clicks: 0, uniqueIps: new Set() })
    }
    const dayData = dailyClicksMap.get(date)!
    dayData.clicks++
    dayData.uniqueIps.add(click.ip)
  })

  const dailyStats = Array.from(dailyClicksMap.entries())
    .map(([date, data]) => ({
      date,
      clicks: data.clicks,
      uniqueVisitors: data.uniqueIps.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Top referrers
  const referrerMap = new Map<string, number>()
  clicks.forEach((click) => {
    const referrer = click.referrer || "Direct"
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1)
  })

  const topReferrers = Array.from(referrerMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Source breakdown
  const sourceMap = new Map<string, number>()
  clicks.forEach((click) => {
    sourceMap.set(click.sourceType, (sourceMap.get(click.sourceType) || 0) + 1)
  })

  const sourceBreakdown = Object.fromEntries(sourceMap)

  return {
    totalClicks: clicks.length,
    uniqueVisitors: uniqueIps.size,
    dailyStats,
    topReferrers,
    sourceBreakdown,
  }
}

async function updateDailyStats(shortCode: string, _ip: string) {
  const today = new Date().toISOString().split("T")[0]
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

export default function useClicks() {
  return {
    recordClick,
    getClicks,
    getClickStats,
    updateDailyStats,
    getClicksForDate,
    getDailyStats,
    determineSourceType,
  }
}
