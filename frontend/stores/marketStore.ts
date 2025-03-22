import { defineStore } from 'pinia'
import { ref } from 'vue'

interface MarketData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const useMarketStore = defineStore('market', () => {
  const mockData = ref<MarketData[]>([])
  const coindeskData = ref<MarketData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function generateMockData() {
    try {
      const data: MarketData[] = []
      const now = new Date()
      
      data.push({
        date: new Date('2025-02-20'),
        open: 30149.2,
        close: 28568.72,
        high: 31010.27,
        low: 27905.33,
        volume: 1744.95
      })

      data.push({
        date: new Date('2025-02-21'),
        open: 44824.49,
        close: 46378.91,
        high: 47089.52,
        low: 44775.58,
        volume: 3165.6
      })

      for (let i = 2; i < 24; i++) {
        const date = new Date(now.getTime() - (23 - i) * 3600000)
        const basePrice = 40000 + Math.random() * 2000
        
        data.push({
          date,
          open: basePrice,
          high: basePrice + Math.random() * 200,
          low: basePrice - Math.random() * 200,
          close: basePrice + (Math.random() - 0.5) * 400,
          volume: Math.random() * 1000000
        })
      }
      
      mockData.value = data
    } catch (err) {
      console.error('Error generating mock data:', err)
      error.value = 'Error generating mock data'
    }
  }

  async function fetchCoindeskData() {
    try {
      loading.value = true
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
      const data = await response.json()
      
      const currentPrice = data.bpi.USD.rate_float
      const now = new Date()
      
      const newDataPoint = {
        date: now,
        open: currentPrice * 0.999,
        high: currentPrice * 1.001,
        low: currentPrice * 0.998,
        close: currentPrice,
        volume: Math.random() * 1000000
      }

      if (coindeskData.value.length === 0) {
        coindeskData.value = [newDataPoint]
      } else {
        coindeskData.value = [newDataPoint, ...coindeskData.value.slice(0, 23)]
      }
    } catch (err) {
      console.error('Error fetching Coindesk data:', err)
      error.value = 'Error fetching data'
    } finally {
      loading.value = false
    }
  }

  return {
    mockData,
    coindeskData,
    loading,
    error,
    generateMockData,
    fetchCoindeskData
  }
})

// Важно: добавляем поддержку hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarketStore, import.meta.hot))
} 