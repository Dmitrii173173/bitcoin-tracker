import axios from 'axios'
import { Client } from 'pg'

const db = new Client({
  user: 'postgres',
  password: 'password',
  host: 'db',
  port: 5433,
  database: 'bitcoin_tracker'
})

await db.connect()

const fetchPrice = async () => {
  try {
    const res = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
    const price = res.data.bpi.USD.rate_float

    await db.query('INSERT INTO "Price" (id, timestamp, value) VALUES (gen_random_uuid(), now(), $1)', [price])
    console.log('Добавлена цена:', price)
  } catch (error) {
    console.error('Ошибка загрузки:', error)
  }
}

setInterval(fetchPrice, 60000)
