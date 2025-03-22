import { defineStore } from 'pinia';

export const useCoindeskStore = defineStore('coindesk', {
  state: () => ({
    priceHistory: [],
    currentPrice: 0,
    high: 0,
    low: 0,
    volume: 0,
    change: 0
  }),

  actions: {
    async fetchPriceData(period) {
      try {
        const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await response.json();
        
        this.currentPrice = parseFloat(data.bpi.USD.rate.replace(',', ''));
        
        // Генерируем временные точки для графика
        let points;
        switch(period) {
          case 'day': points = 12; break;
          case 'week': points = 7; break;
          case 'month': points = 15; break;
          case 'year': points = 12; break;
          default: points = 12;
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

          newHistory.push({
            timestamp,
            price
          });
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