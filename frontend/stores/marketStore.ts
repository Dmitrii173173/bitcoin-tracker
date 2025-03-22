import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface MarketData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const useMarketStore = defineStore('market', () => {
  const mockData = ref<MarketData[]>([]);
  const coindeskData = ref<MarketData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Генерация мок данных
  const generateMockData = () => {
    const data: MarketData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getTime() - i * 3600000);
      const basePrice = 40000 + Math.random() * 2000;
      
      data.push({
        date,
        open: basePrice,
        high: basePrice + Math.random() * 200,
        low: basePrice - Math.random() * 200,
        close: basePrice + (Math.random() - 0.5) * 400,
        volume: Math.random() * 1000000
      });
    }
    
    mockData.value = data;
  };

  // Получение данных Coindesk
  const fetchCoindeskData = async () => {
    try {
      loading.value = true;
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
      const data = await response.json();
      
      const currentPrice = data.bpi.USD.rate_float;
      const now = new Date();
      
      coindeskData.value.unshift({
        date: now,
        open: currentPrice,
        high: currentPrice * 1.001,
        low: currentPrice * 0.999,
        close: currentPrice,
        volume: Math.random() * 1000000
      });

      // Оставляем только последние 24 записи
      if (coindeskData.value.length > 24) {
        coindeskData.value = coindeskData.value.slice(0, 24);
      }
      
    } catch (err) {
      error.value = 'Ошибка при получении данных';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  return {
    mockData,
    coindeskData,
    loading,
    error,
    generateMockData,
    fetchCoindeskData
  };
}); 