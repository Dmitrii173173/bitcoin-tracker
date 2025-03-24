import { defineStore } from 'pinia'

interface Candle {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  timeframe: string
  symbol: string
}

interface CandleState {
  candles: Candle[]
  loading: boolean
  error: string | null
  selectedTimeframe: string
  selectedSymbol: string
}

export const useCandleStore = defineStore('candles', {
  state: (): CandleState => ({
    candles: [],
    loading: false,
    error: null,
    selectedTimeframe: '1h',
    selectedSymbol: 'BTCUSDT'
  }),

  getters: {
    getCandlesByTimeframe: (state) => (timeframe: string) => {
      return state.candles.filter(candle => candle.timeframe === timeframe)
    },
    
    getLatestCandle: (state) => {
      if (state.candles.length === 0) return null
      return state.candles[state.candles.length - 1]
    }
  },

  actions: {
    async fetchCandles(timeframe: string = '1h', limit: number = 100) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/candles?timeframe=${timeframe}&limit=${limit}`)
        if (!response.ok) throw new Error('Ошибка получения данных')
        
        const data = await response.json()
        this.candles = data
        this.selectedTimeframe = timeframe
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Неизвестная ошибка'
      } finally {
        this.loading = false
      }
    },

    setTimeframe(timeframe: string) {
      this.selectedTimeframe = timeframe
      this.fetchCandles(timeframe)
    },

    setSymbol(symbol: string) {
      this.selectedSymbol = symbol
      this.fetchCandles(this.selectedTimeframe)
    },

    // Добавление новой свечи
    addCandle(candle: Candle) {
      // Проверяем, нет ли уже свечи с таким timestamp
      const existingIndex = this.candles.findIndex(
        c => c.timestamp === candle.timestamp && 
            c.timeframe === candle.timeframe && 
            c.symbol === candle.symbol
      )

      if (existingIndex !== -1) {
        // Обновляем существующую свечу
        this.candles[existingIndex] = candle
      } else {
        // Добавляем новую свечу
        this.candles.push(candle)
      }

      // Сортируем свечи по времени
      this.candles.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    },

    // Очистка старых данных
    clearOldData() {
      const now = new Date()
      const maxAge = {
        '1m': 24 * 60 * 60 * 1000,    // 24 часа
        '5m': 7 * 24 * 60 * 60 * 1000, // 7 дней
        '15m': 30 * 24 * 60 * 60 * 1000, // 30 дней
        '1h': 90 * 24 * 60 * 60 * 1000,  // 90 дней
        '4h': 180 * 24 * 60 * 60 * 1000, // 180 дней
        '1d': 365 * 24 * 60 * 60 * 1000  // 1 год
      }

      this.candles = this.candles.filter(candle => {
        const candleDate = new Date(candle.timestamp)
        const age = now.getTime() - candleDate.getTime()
        return age <= maxAge[candle.timeframe as keyof typeof maxAge]
      })
    }
  }
}) 