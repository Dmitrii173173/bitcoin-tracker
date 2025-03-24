import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Функция для получения данных из Binance API и сохранения в базу
const fetchBinanceData = async () => {
  try {
    console.log('Получение текущих данных Binance...')
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
    const data = response.data
    
    // Сохраняем данные в таблицу Price
    await prisma.price.create({
      data: {
        price: parseFloat(data.price),
        source: 'binance'
      }
    })
    
    console.log(`Сохранены данные Binance: ${data.price} USDT`)
  } catch (error) {
    console.error('Ошибка получения данных Binance:', error.message)
  }
}

// Получаем данные Binance при запуске и затем каждую минуту
setTimeout(fetchBinanceData, 2000)
setInterval(fetchBinanceData, 60 * 1000)

console.log('Коллектор данных запущен')

