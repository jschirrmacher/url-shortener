import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatLocalDate } from '~/utils/dateUtils'

// Mock the clickDataService
const mockGetClicks = vi.fn()
const mockRecordClick = vi.fn()
const mockUpdateShortCode = vi.fn()

vi.mock('~/server/clickDataService', () => ({
  default: () => ({
    getClicks: mockGetClicks,
    recordClick: mockRecordClick,
    updateShortCode: mockUpdateShortCode,
  })
}))

// Mock the csvService
const mockReadCsv = vi.fn()
const mockWriteCsv = vi.fn()
const mockAppendToCsv = vi.fn()

vi.mock('~/server/csvService', () => ({
  default: () => ({
    readCsv: mockReadCsv,
    writeCsv: mockWriteCsv,
    appendToCsv: mockAppendToCsv,
  })
}))

describe('useClicks - fillMissingDaysToToday', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReadCsv.mockResolvedValue([])
  })

  it('should include today even if no data exists', async () => {
    mockGetClicks.mockResolvedValue([])

    const useClicks = (await import('~/server/useClicks')).default
    const { getClickStats } = useClicks()
    const stats = await getClickStats('test')
    
    // Should have at least today
    expect(stats.dailyStats.length).toBeGreaterThanOrEqual(1)
    
    const todayStr = formatLocalDate(new Date())
    const todayStats = stats.dailyStats.find(day => day.date === todayStr)
    
    expect(todayStats).toBeDefined()
    expect(todayStats?.clicks).toBe(0)
    expect(todayStats?.uniqueVisitors).toBe(0)
  })

  it('should fill gaps between days with zero values', async () => {
    // Use recent dates to avoid too large date ranges
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = formatLocalDate(twoDaysAgo)
    
    const todayStr = formatLocalDate(new Date())

    // Mock clicks with gaps (missing yesterday)
    const mockClicks = [
      { shortCode: 'test', timestamp: `${twoDaysAgoStr}T10:00:00Z`, ip: '1.1.1.1', userAgent: 'test', referrer: '', sourceType: 'direct' },
      { shortCode: 'test', timestamp: `${todayStr}T10:00:00Z`, ip: '2.2.2.2', userAgent: 'test', referrer: '', sourceType: 'direct' },
    ]

    mockGetClicks.mockResolvedValue(mockClicks)

    const useClicks = (await import('~/server/useClicks')).default
    const { getClickStats } = useClicks()
    const stats = await getClickStats('test')
    
    // Find yesterday (the filled day)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatLocalDate(yesterday)
    
    const filledDay = stats.dailyStats.find(day => day.date === yesterdayStr)
    expect(filledDay).toBeDefined()
    expect(filledDay?.clicks).toBe(0)
    expect(filledDay?.uniqueVisitors).toBe(0)
  })

  it('should include today even if data exists for other days', async () => {
    // Mock clicks from yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatLocalDate(yesterday)
    
    const mockClicks = [
      { shortCode: 'test', timestamp: `${yesterdayStr}T10:00:00Z`, ip: '1.1.1.1', userAgent: 'test', referrer: '', sourceType: 'direct' },
    ]

    mockGetClicks.mockResolvedValue(mockClicks)

    const useClicks = (await import('~/server/useClicks')).default
    const { getClickStats } = useClicks()
    const stats = await getClickStats('test')
    
    const todayStr = formatLocalDate(new Date())
    const todayStats = stats.dailyStats.find(day => day.date === todayStr)
    
    expect(todayStats).toBeDefined()
    expect(todayStats?.clicks).toBe(0)
    expect(todayStats?.uniqueVisitors).toBe(0)
  })
})
