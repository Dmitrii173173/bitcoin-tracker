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

  async function generateMockData() {
    try {
      loading.value = true
      const response = await fetch('/data/bitcoin_data.json')
      const jsonData = await response.json()
      
      const data = jsonData.map(item => ({
        date: new Date(item.date),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume)
      }))
      
      mockData.value = data
    } catch (err) {
      console.error('Ошибка при загрузке данных из файла:', err)
      error.value = 'Ошибка при загрузке данных'
    } finally {
      loading.value = false
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