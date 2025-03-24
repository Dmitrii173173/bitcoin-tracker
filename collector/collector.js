import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Функция для получения свечей с Binance API
const fetchBinanceCandles = async (symbol, interval, limit = 100) => {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
      params: {
        symbol: symbol,
        interval: interval,
        limit: limit
      }
    })
    
    return response.data.map(candle => ({
      timestamp: new Date(candle[0]),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      timeframe: interval,
      symbol: symbol
    }))
  } catch (error) {
    console.error(`Ошибка получения свечей ${interval}:`, error.message)
    return []
  }
}

// Функция для сохранения свечей в базу данных
const saveCandles = async (candles) => {
  try {
    for (const candle of candles) {
      await prisma.candle.upsert({
        where: {
          timestamp_timeframe_symbol: {
            timestamp: candle.timestamp,
            timeframe: candle.timeframe,
            symbol: candle.symbol
          }
        },
        update: candle,
        create: candle
      })
    }
    console.log(`Сохранено ${candles.length} свечей`)
  } catch (error) {
    console.error('Ошибка сохранения свечей:', error.message)
  }
}

// Функция для получения текущей цены
const fetchCurrentPrice = async () => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
    const data = response.data
    
    await prisma.price.create({
      data: {
        price: parseFloat(data.price),
        source: 'binance'
      }
    })
    
    console.log(`Сохранена текущая цена: ${data.price} USDT`)
  } catch (error) {
    console.error('Ошибка получения текущей цены:', error.message)
  }
}

// Таймфреймы для получения свечей
const timeframes = [
  { interval: '1m', limit: 100 },
  { interval: '5m', limit: 100 },
  { interval: '15m', limit: 100 },
  { interval: '1h', limit: 100 },
  { interval: '4h', limit: 100 },
  { interval: '1d', limit: 100 }
]

// Функция для обновления всех свечей
const updateAllCandles = async () => {
  for (const tf of timeframes) {
    const candles = await fetchBinanceCandles('BTCUSDT', tf.interval, tf.limit)
    await saveCandles(candles)
  }
}

// Запускаем обновление данных
const startDataCollection = async () => {
  console.log('Запуск сбора данных...')
  
  // Получаем текущую цену каждую минуту
  setInterval(fetchCurrentPrice, 60 * 1000)
  
  // Получаем свечи каждые 5 минут
  setInterval(updateAllCandles, 5 * 60 * 1000)
  
  // Первоначальное получение данных
  await Promise.all([
    fetchCurrentPrice(),
    updateAllCandles()
  ])
}

startDataCollection()

console.log('Коллектор данных запущен')

