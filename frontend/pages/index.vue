<template>
  <div class="container">
    <div class="charts-grid">
      <ClientOnly>
        <PriceChart
          v-if="store.mockData.length"
          title="BTC/USDT (Mock)"
          :data="store.mockData"
          :isMock="true"
        />
        <PriceChart
          v-if="store.coindeskData.length"
          title="BTC/USD (Coindesk)"
          :data="store.coindeskData"
          :isMock="false"
        />
      </ClientOnly>
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
  if (!store.mockData.length) {
    store.generateMockData();
  }
  store.fetchCoindeskData();

  // Обновляем данные каждую минуту
  setInterval(() => {
    store.fetchCoindeskData();
  }, 60000);
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 20px;
}

.tables-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
