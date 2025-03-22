import { defineStore } from 'pinia';

interface MarketData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    mockData: [] as MarketData[],
    coindeskData: [] as MarketData[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getMockData: (state) => state.mockData,
    getCoindeskData: (state) => state.coindeskData,
    isLoading: (state) => state.loading
  },

  actions: {
    generateMockData() {
      try {
        const data: MarketData[] = [];
        const now = new Date();
        
        // Пример данных из промпта
        data.push({
          date: new Date('2025-02-20'),
          open: 30149.2,
          close: 28568.72,
          high: 31010.27,
          low: 27905.33,
          volume: 1744.95
        });

        data.push({
          date: new Date('2025-02-21'),
          open: 44824.49,
          close: 46378.91,
          high: 47089.52,
          low: 44775.58,
          volume: 3165.6
        });

        // Добавляем дополнительные данные
        for (let i = 2; i < 24; i++) {
          const date = new Date(now.getTime() - (23 - i) * 3600000);
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
        
        this.mockData = data;
      } catch (error) {
        console.error('Error generating mock data:', error);
        this.error = 'Error generating mock data';
      }
    },

    async fetchCoindeskData() {
      try {
        this.loading = true;
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await response.json();
        
        const currentPrice = data.bpi.USD.rate_float;
        const now = new Date();
        
        const newDataPoint = {
          date: now,
          open: currentPrice * 0.999,
          high: currentPrice * 1.001,
          low: currentPrice * 0.998,
          close: currentPrice,
          volume: Math.random() * 1000000
        };

        if (this.coindeskData.length === 0) {
          this.coindeskData = [newDataPoint];
        } else {
          this.coindeskData = [newDataPoint, ...this.coindeskData.slice(0, 23)];
        }
      } catch (error) {
        console.error('Error fetching Coindesk data:', error);
        this.error = 'Error fetching data';
      } finally {
        this.loading = false;
      }
    }
  }
}); 