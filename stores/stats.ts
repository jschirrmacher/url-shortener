import type { UrlStats } from '~/types/index'

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<UrlStats | null>(null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref('')

  const loadStats = async (shortCode: string) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await $fetch<UrlStats>(`/api/urls/${shortCode}/stats`)
      stats.value = response
    } catch (err) {
      error.value = 'Fehler beim Laden der Statistiken'
      console.error('Fehler beim Laden der Statistiken:', err)
    } finally {
      loading.value = false
    }
  }

  const loadPrevStats = async () => {
    if (loadingMore.value || !stats.value?._links?.prev) return

    try {
      loadingMore.value = true
      const response = await $fetch<UrlStats>(stats.value._links.prev.href)
      stats.value = response
    } catch (err) {
      console.error('Fehler beim Laden älterer Daten:', err)
    } finally {
      loadingMore.value = false
    }
  }

  const loadNextStats = async () => {
    if (loadingMore.value || !stats.value?._links?.next) return

    try {
      loadingMore.value = true
      const response = await $fetch<UrlStats>(stats.value._links.next.href)
      stats.value = response
    } catch (err) {
      console.error('Fehler beim Laden neuerer Daten:', err)
    } finally {
      loadingMore.value = false
    }
  }

  return {
    stats,
    loading,
    loadingMore,
    error,
    loadStats,
    loadPrevStats,
    loadNextStats
  }
})
