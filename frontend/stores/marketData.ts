import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CandlestickData, CoindeskData } from '~/types';
import { useMarketStore } from "~/stores/marketStore"; // Убедитесь, что путь правильный

interface CoindeskState {
  priceHistory: Array<{ timestamp: Date; price: number }>;
  currentPrice: number;
  high: number;
  low: number;
  volume: number;
  change: string;
}

export const useCoindeskStore = defineStore<'coindesk', CoindeskState>('coindesk', {
  state: () => ({
    priceHistory: [],
    currentPrice: 0,
    high: 0,
    low: 0,
    volume: 0,
    change: '0'
  }),

  actions: {
    async fetchPriceData(period: string) {
      try {
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await response.json();
        
        console.log(data); // Для проверки данных
        this.currentPrice = parseFloat(data.bpi.USD.rate.replace(',', ''));
        
        // Генерируем временные точки для графика
        let points = 12;
        switch(period) {
          case 'day': points = 12; break;
          case 'week': points = 7; break;
          case 'month': points = 15; break;
          case 'year': points = 12; break;
        }

        const now = new Date();
        const newHistory = [];
        let lastPrice = this.currentPrice;

        for (let i = points; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * 3600000));
          const variation = this.currentPrice * 0.001;
          const trend = Math.random() < 0.6 ? 1 : -1;
          const price = lastPrice + (trend * variation * Math.random());
          lastPrice = price;

          newHistory.push({ timestamp, price });
        }

        this.priceHistory = newHistory;
        this.high = Math.max(...newHistory.map(p => p.price));
        this.low = Math.min(...newHistory.map(p => p.price));
        this.volume = Math.floor(Math.random() * 1000000);
        this.change = ((this.currentPrice - newHistory[0].price) / newHistory[0].price * 100).toFixed(2);

      } catch (error) {
        console.error('Error fetching Coindesk data:', error);
      }
    }
  }
});

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
  const initializeMockData = async () => {
    try {
      loading.value = true;
      const response = await fetch('/data/bitcoin_data.json');
      const jsonData = await response.json();
      console.log(jsonData); // Для проверки данных
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
    } catch (error) {
      console.error('Error initializing mock data:', error);
    } finally {
      loading.value = false;
    }
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
  const filterDataByTimeframe = (data: any[], timeframe: string) => {
    if (!data || !timeframe) return [];
    
    const now = new Date();
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      switch (timeframe) {
        case '1H':
          return now.getTime() - itemDate.getTime() <= 3600000;
        case '24H':
          return now.getTime() - itemDate.getTime() <= 86400000;
        case '7D':
          return now.getTime() - itemDate.getTime() <= 604800000;
        case '1M':
          return now.getTime() - itemDate.getTime() <= 2592000000;
        default:
          return true;
      }
    });
    return filtered;
  };

  const mockTimeframe = ref('24H');
  
  const filteredMockData = computed(() => {
    const data = filterDataByTimeframe(mockData.value, mockTimeframe.value);
    console.log(data); // Добавьте эту строку для проверки отфильтрованных данных
    return data;
  });
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