<template>
  <div class="bitcoin-chart">
    <PriceChart :title="'BTC/USDT'" :data="store.mockData" :isMock="true" />

    <PriceChart
      :title="'BTC/USD (Coindesk)'"
      :data="store.historicalData"
      :isMock="false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMarketDataStore } from "~/stores/marketData";
import PriceChart from "./PriceChart.vue";

const store = useMarketDataStore();

onMounted(() => {
  // Загружаем сохраненные данные
  store.loadSavedData();

  // Если нет mock данных, инициализируем их
  if (!store.mockData.length) {
    store.initializeMockData();
  }

  // Получаем актуальные данные Coindesk
  store.fetchCoindeskData();
  store.fetchHistoricalData("24H"); // Загружаем исторические данные

  // Обновляем данные каждую минуту
  setInterval(() => {
    store.fetchCoindeskData();
    store.fetchHistoricalData(store.selectedTimeframe); // Обновляем исторические данные
  }, 60000);
});
</script>

<style scoped>
.bitcoin-chart {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 20px;
}

@media (max-width: 1024px) {
  .bitcoin-chart {
    grid-template-columns: 1fr;
  }
}
</style>
