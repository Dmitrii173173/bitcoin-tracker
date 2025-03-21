const { PrismaClient } = require('@prisma/client')
const axios = require('axios')

const prisma = new PrismaClient()

async function collectPrice() {
  try {
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json', {
      timeout: 5000,
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
        keepAlive: true,
        timeout: 5000
      })
    })
    
    const price = response.data.bpi.USD.rate_float

    await prisma.price.create({
      data: {
        price: price
      }
    })
    
    console.log(`Price collected: ${price}`)
    return response.data;
  } catch (error) {
    console.error('Error collecting price:', error.message)
    await new Promise(resolve => setTimeout(resolve, 5000))
    return null;
  }
}

// Запуск сбора данных каждую минуту
setInterval(collectPrice, 60000)

// Первый запуск сразу
collectPrice() 