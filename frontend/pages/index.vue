<template>
  <div class="container">
    <div class="charts-section">
      <PriceChart
        title="BTC/USDT (Mock)"
        :data="store.mockData"
        :isMock="true"
      />
      <PriceChart
        title="BTC/USD (Coindesk)"
        :data="store.coindeskData"
        :isMock="false"
      />
    </div>

    <div class="tables-section">
      <DataTable
        title="Mock Data"
        :data="store.mockData"
        :onRefresh="store.generateMockData"
      />
      <DataTable
        title="Coindesk Data"
        :data="store.coindeskData"
        :onRefresh="store.fetchCoindeskData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMarketStore } from "~/stores/marketStore";
import PriceChart from "~/components/PriceChart.vue";
import DataTable from "~/components/DataTable.vue";

const store = useMarketStore();

onMounted(() => {
  // Инициализация данных
  store.generateMockData();
  store.fetchCoindeskData();

  // Обновление данных каждую минуту
  setInterval(() => {
    store.fetchCoindeskData();
  }, 60000);
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.tables-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .charts-section,
  .tables-section {
    grid-template-columns: 1fr;
  }
}
</style>
