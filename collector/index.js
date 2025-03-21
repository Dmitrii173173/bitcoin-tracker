const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Mock данные для случаев, когда API недоступен
function getMockPrice() {
  return 40000 + Math.random() * 10000;
}

async function tryFetchPrice() {
  try {
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json', { timeout: 5000 });
    if (!response.data?.bpi?.USD?.rate_float) {
      throw new Error('Invalid API response structure');
    }
    return response.data.bpi.USD.rate_float;
  } catch (error) {
    console.log(`API error: ${error.message}`);
    return getMockPrice();
  }
}

// Эндпоинт для получения и сохранения цены
app.get('/fetch-price', async (req, res) => {
  try {
    const price = await tryFetchPrice();
    await prisma.price.create({ data: { price } });
    res.json({ success: true, price });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Эндпоинт для получения сохраненных цен
app.get('/get-prices', async (req, res) => {
  try {
    const prices = await prisma.price.findMany({ orderBy: { id: 'desc' }, take: 10 });
    res.json({ success: true, prices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Отдача HTML страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
