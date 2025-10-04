import useCsvService from "~/server/csvService"
import useClickDataService from "~/server/clickDataService"
import type { SourceType, ClickData, DailyStats, DailyStatsEntry } from "~/types/index"
import { formatLocalDate } from "~/utils/dateUtils"

const STATS_FILE = "./data/stats.csv"

const { getClicks, recordClick, updateShortCode } = useClickDataService()

async function recordClickWithStats(clickData: ClickData) {
  await recordClick(clickData)
  await updateDailyStats(clickData.shortCode, clickData.ip)
}

// Fill all missing days from first data point to today
function fillMissingDaysToToday(dailyStats: DailyStatsEntry[]): DailyStatsEntry[] {
  const today = new Date()
  const todayStr = formatLocalDate(today)
  
  if (dailyStats.length === 0) {
    return [{
      date: todayStr,
      clicks: 0,
      uniqueVisitors: 0,
    }]
  }

  const result: DailyStatsEntry[] = []
  const dataMap = new Map(dailyStats.map((stat) => [stat.date, stat]))

  // Get date range from oldest data to today
  const oldestDate = new Date(dailyStats[dailyStats.length - 1]!.date + 'T00:00:00')
  const todayDate = new Date(todayStr + 'T00:00:00')
  
  const currentDate = new Date(oldestDate)
  while (currentDate <= todayDate) {
    const dateStr = formatLocalDate(currentDate)
    
    result.push(
      dataMap.get(dateStr) || {
        date: dateStr,
        clicks: 0,
        uniqueVisitors: 0,
      },
    )
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result.reverse() // newest first
}

type PaginationOptions = {
  offset?: number
  limit?: number
}

async function getClickStats(shortCode: string, options?: PaginationOptions) {
  const clicks = await getClicks(shortCode)

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
      self: { href: "" }, // Will be set by API handler
      first: { href: "" },
      url: { href: "" },
    },
  }
}

const clickFields = ["date", "shortCode", "clicks", "uniqueIps"]
async function updateDailyStats(shortCode: string, _ip: string) {
  const today = new Date().toISOString().split("T")[0]
  if (!today) return

  const { readCsv, writeCsv, appendToCsv } = useCsvService()
  const dailyStats = (await readCsv(STATS_FILE)) as DailyStats[]

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

    await writeCsv(STATS_FILE, updatedStats as DailyStats[], clickFields)
  } else {
    // Create new stat
    const newStat = {
      date: today,
      shortCode,
      clicks: 1,
      uniqueIps: 1,
    }

    await appendToCsv(STATS_FILE, newStat, clickFields)
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

  // Update clicks via clickDataService
  await updateShortCode(oldShortCode, newShortCode)

  // Update stats.csv
  const stats = (await readCsv(STATS_FILE)) as unknown as DailyStats[]
  const updatedStats = stats.map((stat) => {
    if (stat.shortCode === oldShortCode) {
      return { ...stat, shortCode: newShortCode }
    }
    return stat
  })

  if (updatedStats.length > 0) {
    await writeCsv(STATS_FILE, updatedStats as DailyStats[], clickFields)
  }
}

export default function useClicks() {
  return {
    recordClickWithStats,
    getClicks,
    getClickStats,
    updateDailyStats,
    getClicksForDate,
    getDailyStats,
    determineSourceType,
    updateShortCodeInClicks,
  }
}
