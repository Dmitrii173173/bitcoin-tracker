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

  // API URL
  const apiBaseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api' 
    : '/api';

  async function generateMockData() {
    try {
      loading.value = true;
      
      // Сначала пробуем инициализировать данные в БД, если это еще не сделано
      await fetch(`${apiBaseUrl}/import-mock-data`, {
        method: 'POST'
      });
      
      // Затем получаем данные для периода "день"
      const response = await fetch(`${apiBaseUrl}/historical?period=day&source=mock`);
      const jsonData = await response.json();
      
      // Преобразуем данные для использования во фронтенде
      mockData.value = jsonData.map((item: any) => ({
        date: new Date(item.date),
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume),
        period: item.period
      }));
    } catch (err) {
      console.error('Ошибка при загрузке мокнутых данных:', err);
      error.value = 'Ошибка при загрузке данных';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistoricalByPeriod(period: string) {
    try {
      loading.value = true;
      
      const response = await fetch(`${apiBaseUrl}/historical?period=${period}&source=mock`);
      const jsonData = await response.json();
      
      // Преобразуем данные для использования во фронтенде
      mockData.value = jsonData.map((item: any) => ({
        date: new Date(item.date),
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume),
        period: item.period
      }));
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
      
      // Обновляем данные Coindesk через бэкенд
      await fetch(`${apiBaseUrl}/update-coindesk`, {
        method: 'POST'
      });
      
      // Получаем последние данные
      const response = await fetch(`${apiBaseUrl}/coindesk`);
      const data = await response.json();
      
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