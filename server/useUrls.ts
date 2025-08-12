import useCsvService from "~/server/csvService"
import useClicks from "~/server/useClicks"
import type { UrlRecord } from "~/types/index"

interface CreateUrlData {
  originalUrl: string
  customCode?: string
  title?: string
  createdBy: string
}

const URLS_FILE = "./data/urls.csv"

async function createShortUrl(data: CreateUrlData) {
  const { originalUrl, customCode, title, createdBy } = data

  // Validiere URL
  try {
    new URL(originalUrl)
  } catch {
    throw new Error("Ungültige URL")
  }

  let shortCode: string

  if (customCode) {
    // Prüfe ob Custom Code bereits existiert
    const existingUrl = await getUrlByShortCode(customCode)
    if (existingUrl) {
      throw new Error("Short Code bereits vergeben")
    }
    shortCode = customCode
  } else {
    // Generiere eindeutigen Short Code
    shortCode = await generateUniqueShortCode()
  }

  const urlRecord = {
    shortCode,
    originalUrl,
    title: title || "",
    createdAt: new Date().toISOString(),
    createdBy,
  }

  const { appendToCsv } = useCsvService()
  await appendToCsv(URLS_FILE, urlRecord, ["shortCode", "originalUrl", "title", "createdAt", "createdBy"])

  const config = useRuntimeConfig()
  const baseUrl = config.baseUrl ?? "http://localhost:3000"

  return {
    shortCode,
    originalUrl,
    title: title ?? "",
    shortUrl: `${baseUrl}/${shortCode}`,
  }
}

async function getUrlByShortCode(shortCode: string) {
  const { readCsv } = useCsvService()
  const urls = (await readCsv(URLS_FILE)) as unknown as UrlRecord[]
  return urls.find((u) => u.shortCode === shortCode) || null
}

async function getUserUrls(username: string) {
  const { readCsv } = useCsvService()
  const urls = (await readCsv(URLS_FILE)) as unknown as UrlRecord[]

  const userUrls = urls
    .filter((url) => url.createdBy === username)
    .map((url) => ({
      ...url,
      clickCount: 0, // Wird später durch getUrlsWithStats ersetzt
    }))

  // Sortiere nach Erstellungsdatum (neueste zuerst)
  return userUrls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

async function getUrlsWithStats(username?: string) {
  const urls = username ? await getUserUrls(username) : await getAllUrls()

  const { getClickStats } = useClicks()

  // Füge Click-Statistiken hinzu
  const urlsWithStats = await Promise.all(
    urls.map(async (url) => {
      const clickStats = await getClickStats(url.shortCode)
      return {
        ...url,
        clickCount: clickStats.totalClicks,
        uniqueVisitors: clickStats.uniqueVisitors,
      }
    }),
  )

  return urlsWithStats
}

async function getAllUrls() {
  const { readCsv } = useCsvService()
  return (await readCsv(URLS_FILE)) as unknown as UrlRecord[]
}

async function recordUrlAccess(shortCode: string, ip: string, userAgent: string, referrer: string) {
  const { determineSourceType, recordClick } = useClicks()
  const sourceType = determineSourceType(referrer, userAgent)

  await recordClick({
    shortCode,
    ip,
    userAgent,
    referrer,
    sourceType,
  })
}

async function getUrlStats(shortCode: string) {
  const url = await getUrlByShortCode(shortCode)
  if (!url) {
    return null
  }

  const { getClickStats } = useClicks()
  const clickStats = await getClickStats(shortCode)

  return {
    url,
    ...clickStats,
  }
}

async function updateUrl(shortCode: string, originalUrl: string, title?: string) {
  // Validiere URL
  try {
    new URL(originalUrl)
  } catch {
    throw new Error("Ungültige URL")
  }

  const { readCsv, writeCsv } = useCsvService()
  const urls = (await readCsv(URLS_FILE)) as unknown as UrlRecord[]
  const urlIndex = urls.findIndex((url) => url.shortCode === shortCode)

  if (urlIndex === -1) {
    throw new Error("URL nicht gefunden")
  }

  // Update URL
  urls[urlIndex].originalUrl = originalUrl
  if (title !== undefined) {
    urls[urlIndex].title = title
  }

  await writeCsv(URLS_FILE, urls as UrlRecord[], ["shortCode", "originalUrl", "title", "createdAt", "createdBy"])

  return {
    success: true,
    message: "URL erfolgreich aktualisiert",
    url: urls[urlIndex],
  }
}

async function deleteUrl(shortCode: string) {
  const { readCsv, writeCsv } = useCsvService()
  const urls = (await readCsv(URLS_FILE)) as unknown as UrlRecord[]
  const filteredUrls = urls.filter((url) => url.shortCode !== shortCode)

  if (urls.length === filteredUrls.length) {
    throw new Error("URL nicht gefunden")
  }

  await writeCsv(URLS_FILE, filteredUrls as UrlRecord[], [
    "shortCode",
    "originalUrl",
    "title",
    "createdAt",
    "createdBy",
  ])
}

async function generateUniqueShortCode() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const existing = await getUrlByShortCode(code)
    if (!existing) {
      return code
    }

    attempts++
  }

  throw new Error("Konnte keinen eindeutigen Short Code generieren")
}

export default function useUrls() {
  return {
    createShortUrl,
    getUrlByShortCode,
    getUserUrls,
    getUrlsWithStats,
    getAllUrls,
    recordUrlAccess,
    getUrlStats,
    updateUrl,
    deleteUrl,
    generateUniqueShortCode,
  }
}
