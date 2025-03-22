import { ref, computed } from 'vue'

interface CoindeskData {
  time: {
    updated: string
  }
  bpi: {
    USD: {
      rate_float: number
    }
  }
}

export function useCoindeskData() {
  const data = ref<CoindeskData | null>(null)
  const historicalData = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentPrice = computed(() => {
    return data.value?.bpi.USD.rate_float || 0
  })

  const fetchCurrentPrice = async () => {
    try {
      loading.value = true
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
      data.value = await response.json()
    } catch (e) {
      error.value = 'Failed to fetch price'
    } finally {
      loading.value = false
    }
  }

  const fetchHistoricalData = async (period: 'day' | 'week' | 'month' | 'year') => {
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
      historicalData.value = Object.entries(data.bpi).map(([date, price]) => ({
        x: new Date(date).getTime(),
        y: price
      }))
    } catch (e) {
      error.value = 'Failed to fetch historical data'
      historicalData.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    historicalData,
    loading,
    error,
    currentPrice,
    fetchCurrentPrice,
    fetchHistoricalData
  }
} 