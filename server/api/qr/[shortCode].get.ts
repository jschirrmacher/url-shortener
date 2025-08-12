import { toString, toBuffer } from "qrcode"
import useUrls from "~/server/useUrls"
import { createHttpError } from "~/server/utils/ErrorCreator"

export default defineEventHandler(async (event) => {
  const shortCode = getRouterParam(event, "shortCode")

  if (!shortCode) {
    throw createHttpError(400, "Short Code ist erforderlich")
  }

  // Validate short code format
  if (!/^[a-z0-9]+$/i.test(shortCode)) {
    throw createHttpError(400, "Ungültiger Short Code")
  }

  try {
    const { getUrlByShortCode } = useUrls()
    const urlData = await getUrlByShortCode(shortCode)

    if (!urlData) {
      throw createHttpError(404, "Short Code nicht gefunden")
    }

    const query = getQuery(event)
    const format = (query.format as string) ?? "png"
    const size = Number.parseInt(query.size as string) ?? 200
    const download = query.download === "true"

    if (!["png", "svg"].includes(format)) {
      throw createHttpError(400, "Format muss 'png' oder 'svg' sein")
    }

    if (size < 50 || size > 1000) {
      throw createHttpError(400, "Größe muss zwischen 50 und 1000 Pixel liegen")
    }

    // Build the full URL for the QR code
    const config = useRuntimeConfig()
    const headers = getHeaders(event)

    // Try to get base URL from various sources
    let baseUrl = config.public?.baseUrl || config.baseUrl

    if (!baseUrl) {
      // Fallback: construct from request headers
      const host = headers.host || "localhost:3000"
      const protocol = headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https")
      baseUrl = `${protocol}://${host}`
    }

    const fullUrl = `${baseUrl}/${shortCode}`

    // Generate QR code
    let qrCodeData: string | Buffer
    const options = { width: size, margin: 2, color: { dark: "#000000", light: "#FFFFFF" } }

    if (format === "svg") {
      qrCodeData = await toString(fullUrl, { ...options, type: "svg" })
    } else {
      qrCodeData = await toBuffer(fullUrl, { ...options, type: "png" })
    }

    // Set appropriate headers
    const contentType = format === "svg" ? "image/svg+xml" : "image/png"
    const filename = `qr-${shortCode}.${format}`
    const disposition = download ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`

    setHeader(event, "Content-Type", contentType)
    setHeader(event, "Content-Disposition", disposition)
    setHeader(event, "Cache-Control", "public, max-age=86400") // 24 hours

    return qrCodeData
  } catch (error) {
     
    console.error("QR Code generation failed:", error)
    throw createHttpError(500, "QR-Code konnte nicht generiert werden: " + (error as Error).message)
  }
})
