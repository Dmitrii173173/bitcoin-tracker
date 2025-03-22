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

  actions: {
    generateMockData() {
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
      
      this.mockData = data;
    },

    async fetchCoindeskData() {
      try {
        this.loading = true;
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await response.json();
        
        const currentPrice = data.bpi.USD.rate_float;
        const now = new Date();
        
        this.coindeskData.unshift({
          date: now,
          open: currentPrice,
          high: currentPrice * 1.001,
          low: currentPrice * 0.999,
          close: currentPrice,
          volume: Math.random() * 1000000
        });

        if (this.coindeskData.length > 24) {
          this.coindeskData = this.coindeskData.slice(0, 24);
        }
      } catch (err) {
        this.error = 'Error fetching data';
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }
}); 