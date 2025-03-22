import { ref, reactive } from 'vue'

const state = reactive({
  priceHistory: [],
  currentPrice: 0,
  high: 0,
  low: 0,
  volume: 0,
  change: '0'
})

export function useCoindeskData() {
  const fetchPriceData = async (period: string) => {
    try {
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
      const data = await response.json()
      
      state.currentPrice = parseFloat(data.bpi.USD.rate.replace(',', ''))
      
      let points = 12
      switch(period) {
        case 'day': points = 12; break
        case 'week': points = 7; break
        case 'month': points = 15; break
        case 'year': points = 12; break
      }

      const now = new Date()
      const newHistory = []
      let lastPrice = state.currentPrice

      for (let i = points; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 3600000))
        const variation = state.currentPrice * 0.001
        const trend = Math.random() < 0.6 ? 1 : -1
        const price = lastPrice + (trend * variation * Math.random())
        lastPrice = price

        newHistory.push({
          timestamp,
          price
        })
      }

      state.priceHistory = newHistory
      state.high = Math.max(...newHistory.map(p => p.price))
      state.low = Math.min(...newHistory.map(p => p.price))
      state.volume = Math.floor(Math.random() * 1000000)
      state.change = ((state.currentPrice - newHistory[0].price) / newHistory[0].price * 100).toFixed(2)

    } catch (error) {
      console.error('Error fetching Coindesk data:', error)
    }
  }

  return {
    state,
    fetchPriceData
  }
} 