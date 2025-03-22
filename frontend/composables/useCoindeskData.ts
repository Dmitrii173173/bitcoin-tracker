import { ref, computed } from 'vue'

export function useCoindeskData() {
  const currentPrice = ref(0)
  const historicalData = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCurrentPrice = async () => {
    try {
      loading.value = true
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
      const data = await response.json()
      currentPrice.value = data.bpi.USD.rate_float
    } catch (e) {
      error.value = 'Failed to fetch price'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const fetchHistoricalData = async (period: string) => {
    try {
      loading.value = true
      const end = new Date()
      let start = new Date()

      switch (period) {
        case 'day':
          start.setDate(start.getDate() - 1)
          break
        case 'week':
          start.setDate(start.getDate() - 7)
          break
        case 'month':
          start.setMonth(start.getMonth() - 1)
          break
        case 'year':
          start.setFullYear(start.getFullYear() - 1)
          break
      }

      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]

      const response = await fetch(
        `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startStr}&end=${endStr}`
      )
      const data = await response.json()
      
      return Object.entries(data.bpi).map(([date, price]) => ({
        x: new Date(date).getTime(),
        y: price
      }))
    } catch (e) {
      error.value = 'Failed to fetch historical data'
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    currentPrice,
    loading,
    error,
    fetchCurrentPrice,
    fetchHistoricalData
  }
} 