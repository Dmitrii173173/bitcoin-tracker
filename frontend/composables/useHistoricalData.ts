import { ref, computed } from 'vue'
import bitcoinData from '~/data/bitcoin_data.json'

interface BitcoinData {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export function useHistoricalData() {
  const data = ref<BitcoinData[]>(bitcoinData)
  
  const currentData = computed(() => {
    if (data.value.length === 0) return null
    return data.value[data.value.length - 1]
  })

  const priceChange = computed(() => {
    if (data.value.length < 2) return 0
    const lastPrice = data.value[data.value.length - 1].close
    const prevPrice = data.value[data.value.length - 2].close
    return Number(((lastPrice - prevPrice) / prevPrice * 100).toFixed(2))
  })

  const getDataByPeriod = (period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date()
    const dates = data.value.map(item => new Date(item.date))
    const filteredData = data.value.filter(item => {
      const date = new Date(item.date)
      switch (period) {
        case 'day':
          return date.getDate() === now.getDate()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return date >= weekAgo
        case 'month':
          return date.getMonth() === now.getMonth()
        case 'year':
          return date.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })

    return filteredData
  }

  return {
    data,
    currentData,
    priceChange,
    getDataByPeriod
  }
} 