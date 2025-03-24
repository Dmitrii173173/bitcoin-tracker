import { defineStore } from 'pinia'
import { ref } from 'vue'

interface MarketData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  period?: string;
}

interface CoindeskCurrentData {
  id: string;
  price: number;
  updatedTime: string;
  code: string;
  createdAt: string;
}

export const useMarketStore = defineStore('market', () => {
  const mockData = ref<MarketData[]>([])
  const coindeskData = ref<MarketData[]>([])
  const coindeskCurrentData = ref<CoindeskCurrentData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // API URL - исправляем, чтобы работало в docker-compose
  const apiBaseUrl = '/api';

  async function generateMockData() {
    try {
      loading.value = true;
      console.log('Загрузка мокнутых данных...');
      
      // Сначала пробуем инициализировать данные в БД, если это еще не сделано
      try {
        const importResponse = await fetch(`${apiBaseUrl}/import-mock-data`, {
          method: 'POST'
        });
        console.log('Результат импорта:', await importResponse.json());
      } catch (importErr) {
        console.error('Ошибка импорта данных:', importErr);
      }
      
      // Затем получаем данные для периода "день"
      const response = await fetch(`${apiBaseUrl}/historical?period=day&source=mock`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log('Получены исторические данные:', jsonData);
      
      // Преобразуем данные для использования во фронтенде
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        mockData.value = jsonData.map((item) => ({
          date: new Date(item.date),
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume),
          period: item.period
        }));
      } else {
        console.warn('API вернул пустой массив или некорректные данные');
        // Используем локальные данные как fallback
        const fallbackResponse = await fetch('/data/bitcoin_data.json');
        const fallbackData = await fallbackResponse.json();
        
        mockData.value = fallbackData.map((item) => ({
          date: new Date(item.date),
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume),
          period: item.period || 'day'
        }));
      }
    } catch (err) {
      console.error('Ошибка при загрузке мокнутых данных:', err);
      error.value = 'Ошибка при загрузке данных';
      
      // Попытка загрузить данные из локального JSON как запасной вариант
      try {
        const fallbackResponse = await fetch('/data/bitcoin_data.json');
        const fallbackData = await fallbackResponse.json();
        
        mockData.value = fallbackData.map((item) => ({
          date: new Date(item.date),
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume),
          period: item.period || 'day'
        }));
        
        console.log('Используем локальные данные вместо API');
      } catch (fallbackErr) {
        console.error('Ошибка при загрузке локальных данных:', fallbackErr);
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistoricalByPeriod(period: string) {
    try {
      loading.value = true;
      console.log(`Загрузка данных для периода ${period}...`);
      
      const response = await fetch(`${apiBaseUrl}/historical?period=${period}&source=mock`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log(`Получены данные для периода ${period}:`, jsonData);
      
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        mockData.value = jsonData.map((item) => ({
          date: new Date(item.date),
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume),
          period: item.period
        }));
      } else {
        console.warn('API вернул пустой массив или некорректные данные для периода', period);
        // Здесь можно использовать запасной вариант, если нужно
      }
    } catch (err) {
      console.error(`Ошибка при загрузке данных для периода ${period}:`, err);
      error.value = 'Ошибка при загрузке данных';
    } finally {
      loading.value = false;
    }
  }

  async function fetchCoindeskData() {
    try {
      loading.value = true;
      console.log('Обновление данных Coindesk...');
      
      // Обновляем данные Coindesk через бэкенд
      try {
        const updateResponse = await fetch(`${apiBaseUrl}/update-coindesk`, {
          method: 'POST'
        });
        console.log('Результат обновления Coindesk:', await updateResponse.json());
      } catch (updateErr) {
        console.error('Ошибка обновления данных Coindesk:', updateErr);
      }
      
      // Получаем последние данные
      const response = await fetch(`${apiBaseUrl}/coindesk`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Получены данные Coindesk:', data);
      
      // Сохраняем в состояние
      coindeskCurrentData.value = data;
      
      // Обновляем график
      const currentPrice = data.price;
      const now = new Date(data.createdAt);
      
      const newDataPoint = {
        date: now,
        open: currentPrice * 0.999,
        high: currentPrice * 1.001,
        low: currentPrice * 0.998,
        close: currentPrice,
        volume: Math.random() * 1000000
      };

      if (coindeskData.value.length === 0) {
        coindeskData.value = [newDataPoint];
      } else {
        coindeskData.value = [newDataPoint, ...coindeskData.value.slice(0, 23)];
      }
    } catch (err) {
      console.error('Ошибка при получении данных Coindesk:', err);
      error.value = 'Ошибка при загрузке данных Coindesk';
      
      // Попытка получить данные напрямую из API Coindesk как запасной вариант
      try {
        const fallbackResponse = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const fallbackData = await fallbackResponse.json();
        
        const currentPrice = fallbackData.bpi.USD.rate_float;
        const now = new Date();
        
        const newDataPoint = {
          date: now,
          open: currentPrice * 0.999,
          high: currentPrice * 1.001,
          low: currentPrice * 0.998,
          close: currentPrice,
          volume: Math.random() * 1000000
        };

        if (coindeskData.value.length === 0) {
          coindeskData.value = [newDataPoint];
        } else {
          coindeskData.value = [newDataPoint, ...coindeskData.value.slice(0, 23)];
        }
        
        console.log('Используем данные напрямую из API Coindesk');
      } catch (fallbackErr) {
        console.error('Ошибка при получении данных напрямую из API Coindesk:', fallbackErr);
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    mockData,
    coindeskData,
    coindeskCurrentData,
    loading,
    error,
    generateMockData,
    fetchHistoricalByPeriod,
    fetchCoindeskData
  }
}) 