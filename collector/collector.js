import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Функция для получения данных из Coindesk API и сохранения в базу
const fetchCoindeskData = async () => {
  try {
    console.log('Получение текущих данных Coindesk...')
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
    const data = response.data
    
    // Сохраняем данные в таблицу CoindeskData
    await prisma.coindeskData.create({
      data: {
        price: data.bpi.USD.rate_float,
        updatedTime: data.time.updatedISO,
        code: data.bpi.USD.code
      }
    })
    
    // Сохраняем текущую цену в таблицу Price
    await prisma.price.create({
      data: {
        price: data.bpi.USD.rate_float,
        source: 'coindesk'
      }
    })
    
    console.log(`Сохранены данные Coindesk: ${data.bpi.USD.rate_float} USD (${data.time.updatedISO})`)
  } catch (error) {
    console.error('Ошибка получения данных Coindesk:', error.message)
  }
}

// Функция для импорта исторических мокнутых данных из бэкенда
const importMockData = async () => {
  try {
    console.log('Проверка импорта исторических данных...')
    
    // Проверяем, есть ли уже данные в базе
    const existingData = await prisma.historicalData.findMany({
      where: { source: 'mock' },
      take: 1
    })
    
    if (existingData.length > 0) {
      console.log('Исторические данные уже импортированы')
      return
    }
    
    // Отправляем запрос на импорт данных
    const response = await axios.post('http://backend:3001/api/import-mock-data')
    console.log('Результат импорта:', response.data)
  } catch (error) {
    console.error('Ошибка импорта мокнутых данных:', error.message)
  }
}

// Импортируем данные при запуске и затем каждый час проверяем необходимость импорта
setTimeout(importMockData, 5000)
setInterval(importMockData, 60 * 60 * 1000)

// Получаем данные Coindesk при запуске и затем каждую минуту
setTimeout(fetchCoindeskData, 2000)
setInterval(fetchCoindeskData, 60 * 1000)

console.log('Коллектор данных запущен')

