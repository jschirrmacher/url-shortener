import useClickDataService from "~/server/clickDataService"
import type { DailyStatsEntry } from "~/types/index"
import { formatLocalDate } from "~/utils/dateUtils"

const { getClicks } = useClickDataService()

// Fill all missing days from first data point to today
function fillMissingDaysToToday(dailyStats: DailyStatsEntry[]): DailyStatsEntry[] {
  const today = new Date()
  const todayStr = formatLocalDate(today)

  if (dailyStats.length === 0) {
    return [
      {
        date: todayStr,
        clicks: 0,
        uniqueVisitors: 0,
      },
    ]
  }

  const result: DailyStatsEntry[] = []
  const dataMap = new Map(dailyStats.map((stat) => [stat.date, stat]))

  // Get date range from oldest data to today
  const oldestDate = new Date(dailyStats[dailyStats.length - 1]!.date + "T00:00:00")
  const todayDate = new Date(todayStr + "T00:00:00")

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

async function getClickStats(shortCode: string) {
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
    dailyStats: fillMissingDaysToToday(allDailyStats),
    topReferrers,
    sourceBreakdown,
  }
}

export default function useClicks() {
  return {
    getClickStats,
  }
}
