import { defineStore } from 'pinia'
import { ref } from 'vue'

// Интерфейс для данных о рынке Bitcoin
interface MarketData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  period?: string;
}

// Хранилище данных о рынке Bitcoin
export const useMarketStore = defineStore('market', () => {
  // Состояние
  const mockData = ref<MarketData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // API URL с учетом проксирования в Docker
  const apiBaseUrl = '/api';

  // Загрузка исторических данных
  async function generateMockData() {
    try {
      loading.value = true;
      error.value = null;
      
      // Инициализация данных в БД, если необходимо
      try {
        await fetch(`${apiBaseUrl}/import-mock-data`, {
          method: 'POST'
        });
      } catch (importErr) {
        console.error('Ошибка инициализации данных:', importErr);
      }
      
      // Получение данных для периода "день" по умолчанию
      const response = await fetch(`${apiBaseUrl}/historical?period=day&source=mock`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // Обработка и сохранение данных
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
        // Если API не вернул данные, используем локальные данные
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
      console.error('Ошибка загрузки данных:', err);
      
      error.value = err instanceof Error ? err.message : 'Ошибка при загрузке данных';
      
      // Попытка использовать локальные данные при ошибке
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
      } catch (fallbackErr) {
        console.error('Не удалось загрузить данные из резервного источника:', fallbackErr);
      }
    } finally {
      loading.value = false;
    }
  }

  // Загрузка данных по конкретному периоду
  async function fetchHistoricalByPeriod(period: string) {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await fetch(`${apiBaseUrl}/historical?period=${period}&source=mock`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
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
        // Фильтруем локальные данные если API не вернул результатов
        const fallbackResponse = await fetch('/data/bitcoin_data.json');
        const fallbackData = await fallbackResponse.json();
        
        mockData.value = fallbackData
          .filter(item => item.period === period)
          .map((item) => ({
            date: new Date(item.date),
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
            volume: Number(item.volume),
            period: item.period
          }));
      }
    } catch (err) {
      console.error(`Ошибка загрузки данных для периода ${period}:`, err);
      error.value = err instanceof Error ? err.message : 'Ошибка при загрузке данных';
    } finally {
      loading.value = false;
    }
  }

  return {
    mockData,
    loading,
    error,
    generateMockData,
    fetchHistoricalByPeriod
  }
}) 