import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CandlestickData, CoindeskData } from '~/types';

export const useMarketDataStore = defineStore('marketData', () => {
  // Mock данные
  const mockData = ref<CandlestickData[]>([]);
  
  // Coindesk данные
  const coindeskData = ref<CoindeskData | null>(null);
  const historicalData = ref<CandlestickData[]>([]);
  
  // Состояние загрузки
  const loading = ref(false);
  
  // Получение данных Coindesk
  const fetchCoindeskData = async () => {
    try {
      loading.value = true;
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
      const data = await response.json();
      coindeskData.value = data;
      
      // Сохраняем в localStorage
      localStorage.setItem('coindeskData', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching Coindesk data:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Инициализация mock данных
  const initializeMockData = () => {
    const now = new Date();
    const mockEntries: CandlestickData[] = [];
    
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getTime() - i * 3600000);
      mockEntries.push({
        date,
        open: 40000 + Math.random() * 2000,
        high: 41000 + Math.random() * 2000,
        low: 39000 + Math.random() * 2000,
        close: 40500 + Math.random() * 2000,
        volume: Math.random() * 1000000
      });
    }
    
    mockData.value = mockEntries;
    localStorage.setItem('mockData', JSON.stringify(mockEntries));
  };
  
  // Загрузка сохраненных данных при инициализации
  const loadSavedData = () => {
    const savedMockData = localStorage.getItem('mockData');
    const savedCoindeskData = localStorage.getItem('coindeskData');
    
    if (savedMockData) {
      mockData.value = JSON.parse(savedMockData);
    }
    
    if (savedCoindeskData) {
      coindeskData.value = JSON.parse(savedCoindeskData);
    }
  };
  
  const fetchHistoricalData = async (timeframe: string) => {
    try {
      loading.value = true;
      const end = new Date();
      let start = new Date();

      switch (timeframe) {
        case '1H':
          start.setHours(start.getHours() - 1);
          break;
        case '24H':
          start.setDate(start.getDate() - 1);
          break;
        case '7D':
          start.setDate(start.getDate() - 7);
          break;
        case '1M':
          start.setMonth(start.getMonth() - 1);
          break;
      }

      const response = await fetch(
        `https://api.coindesk.com/v1/bpi/historical/close.json?start=${start.toISOString().split('T')[0]}&end=${end.toISOString().split('T')[0]}`
      );
      const data = await response.json();
      
      historicalData.value = Object.entries(data.bpi).map(([date, price]) => ({
        date: new Date(date),
        open: price as number,
        high: (price as number) * 1.01, // Примерные значения
        low: (price as number) * 0.99,
        close: price as number,
        volume: Math.random() * 1000000 // Примерное значение
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      loading.value = false;
    }
  };
  
  return {
    mockData,
    coindeskData,
    historicalData,
    loading,
    fetchCoindeskData,
    initializeMockData,
    loadSavedData,
    fetchHistoricalData
  };
}); 