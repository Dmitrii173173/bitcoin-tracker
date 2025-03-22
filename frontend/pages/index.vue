<template>
  <div class="container">
    <div class="section">
      <h2 class="section-title">Mock Data</h2>
      <div class="content-wrapper">
        <ClientOnly>
          <BinanceChart
            v-if="store.mockData.length"
            title="BTC/USDT (Mock)"
            :data="store.mockData"
            :isMock="true"
          />
        </ClientOnly>
        <DataTable
          title="Mock Data Table"
          :data="store.mockData"
          :onRefresh="store.generateMockData"
        />
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Coindesk Data</h2>
      <div class="content-wrapper">
        <ClientOnly>
          <BinanceChart
            v-if="store.coindeskData.length"
            title="BTC/USD (Coindesk)"
            :data="store.coindeskData"
            :isMock="false"
          />
        </ClientOnly>
        <DataTable
          title="Coindesk Data Table"
          :data="store.coindeskData"
          :onRefresh="store.fetchCoindeskData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMarketStore } from "~/stores/marketStore";

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
  background: #0b0e11;
  min-height: 100vh;
  color: white;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

@media (min-width: 1200px) {
  .content-wrapper {
    flex-direction: row;
  }

  .content-wrapper > * {
    flex: 1;
  }
}
</style>
