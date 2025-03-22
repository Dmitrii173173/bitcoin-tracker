<template>
  <div class="container">
    <div class="tables-grid">
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
import { useMarketStore } from "~/stores/marketStore";

const store = useMarketStore();
</script>

<style scoped>
.container {
  padding: 20px;
}

.tables-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 20px;
}

@media (max-width: 1024px) {
  .tables-grid {
    grid-template-columns: 1fr;
  }
}
</style>
