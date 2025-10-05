import useCsvService from "~/server/csvService"
import type { ClickRecord, ClickData } from "~/types/index"
import { createReadStream } from "fs"
import { createInterface } from "readline"

type ClickCsvRecord = {
  shortCode: string
  timestamp: string
  ip: string
  userAgentId: number
  referrer: string
  sourceType: string
}

const CLICKS_FILE = "./data/clicks.csv"
const CLICKS_FIELDS = ["shortCode", "timestamp", "ip", "userAgentId", "referrer", "sourceType"]
const USER_AGENTS_FILE = "./data/user-agents.csv"
const USER_AGENTS_FIELDS = ["id", "userAgent"]

const { readCsv, writeCsv, appendToCsv, parseCsvLine } = useCsvService()

const clicksCache: ClickCsvRecord[] = []
const userAgentCache: string[] = []
const userAgentMap: Record<string, number> = {}

async function loadUserAgents() {
  if (userAgentCache.length > 0) return

  try {
    const userAgents = (await readCsv(USER_AGENTS_FILE)) as Array<{ id: number; userAgent: string }>
    userAgents.forEach(({ id, userAgent }) => {
      userAgentCache[id] = userAgent
      userAgentMap[userAgent] = id
    })
  } catch {
    // File doesn't exist yet
  }
}

async function loadClicks() {
  if (clicksCache.length > 0) return

  await loadUserAgents()

  try {
    const stream = createReadStream(CLICKS_FILE)
    const rl = createInterface({ input: stream })

    const firstLine = await new Promise<string>((resolve, reject) => {
      rl.once("line", resolve)
      rl.once("error", reject)
      stream.once("error", reject)
    })

    const headers = parseCsvLine(firstLine)

    if (!headers.includes("userAgentId") && headers.includes("userAgent")) {
      // Need migration
      console.log("Migrating click data...")

      const userAgentSet = new Map<string, number>()
      const userAgents: Array<{ id: number; userAgent: string }> = []
      const oldClicks: ClickRecord[] = []
      let nextId = 1

      for await (const line of rl) {
        const data = parseCsvLine(line)
        const record = Object.fromEntries(headers.map((header, index) => [header, data[index] || ""]))
        const click = record as ClickRecord
        oldClicks.push(click)

        if (!userAgentSet.has(click.userAgent)) {
          userAgentSet.set(click.userAgent, nextId)
          userAgents.push({ id: nextId, userAgent: click.userAgent })
          userAgentCache[nextId] = click.userAgent
          userAgentMap[click.userAgent] = nextId
          nextId++
        }
      }

      await writeCsv(USER_AGENTS_FILE, userAgents, USER_AGENTS_FIELDS)

      const newClicks = oldClicks.map((click) => ({
        shortCode: click.shortCode,
        timestamp: click.timestamp,
        ip: click.ip,
        userAgentId: userAgentSet.get(click.userAgent)!,
        referrer: click.referrer,
        sourceType: click.sourceType,
      }))

      await writeCsv(CLICKS_FILE, newClicks, CLICKS_FIELDS)
      clicksCache.push(...newClicks)
      console.log(`Migrated ${userAgents.length} unique user agents`)
    } else {
      rl.close()
      const existingClicks = (await readCsv(CLICKS_FILE)) as ClickCsvRecord[]
      clicksCache.push(...existingClicks)
    }
  } catch {
    // File doesn't exist, cache stays empty
  }
}

async function getClicks(shortCode?: string): Promise<ClickRecord[]> {
  await loadClicks()

  const result = clicksCache.map(({ userAgentId, ...click }) => ({
    ...click,
    userAgent: userAgentCache[userAgentId] || "Unknown",
  })) as ClickRecord[]

  return shortCode ? result.filter((click) => click.shortCode === shortCode) : result
}

async function recordClick(clickData: ClickData) {
  await loadClicks()
  await loadUserAgents()

  const clickRecord = {
    shortCode: clickData.shortCode,
    timestamp: new Date().toISOString(),
    ip: clickData.ip,
    userAgentId: Number(userAgentMap[clickData.userAgent] ?? (await saveNewUserAgent(clickData.userAgent))),
    referrer: clickData.referrer,
    sourceType: clickData.sourceType
  }

  await appendToCsv(CLICKS_FILE, clickRecord, CLICKS_FIELDS)

  // Add to cache
  clicksCache.push(clickRecord as ClickCsvRecord)
}

async function saveNewUserAgent(userAgent: string) {
  const userAgentId = userAgentCache.length + 1
  userAgentCache[userAgentId] = userAgent
  userAgentMap[userAgent] = userAgentId
  await appendToCsv(USER_AGENTS_FILE, { userAgentId, userAgent: userAgent }, USER_AGENTS_FIELDS)
  return userAgentId
}

async function updateShortCode(oldShortCode: string, newShortCode: string) {
  await loadClicks()

  const updatedClicks = clicksCache.map((click) => {
    if (click.shortCode === oldShortCode) {
      return { ...click, shortCode: newShortCode }
    }
    return click
  })

  if (updatedClicks.length > 0) {
    await writeCsv(CLICKS_FILE, updatedClicks, CLICKS_FIELDS)
    clicksCache.length = 0
    clicksCache.push(...updatedClicks)
  }
}

export default function useClickDataService() {
  return {
    getClicks,
    recordClick,
    updateShortCode,
  }
}
