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
  
  const formattedData = computed(() => {
    return data.value.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.close,
      high: item.high,
      low: item.low,
      volume: item.volume,
      open: item.open
    }))
  })

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

  return {
    data: formattedData,
    currentData,
    priceChange
  }
} 