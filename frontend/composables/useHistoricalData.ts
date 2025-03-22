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

  const getCandlestickData = (period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date()
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

    return {
      candlesticks: filteredData.map(item => ({
        x: new Date(item.date).getTime(),
        o: item.open,
        h: item.high,
        l: item.low,
        c: item.close
      })),
      volumes: filteredData.map(item => ({
        x: new Date(item.date).getTime(),
        y: item.volume,
        color: item.close >= item.open ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'
      }))
    }
  }

  const getTableData = () => {
    return data.value.map(item => ({
      ...item,
      isPositive: item.close >= item.open,
      volumePercentage: (item.volume / Math.max(...data.value.map(d => d.volume))) * 100
    }))
  }

  return {
    data,
    currentData,
    priceChange,
    getCandlestickData,
    getTableData
  }
} 