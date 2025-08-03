export default defineEventHandler(async (_event) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }
})
