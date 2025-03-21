<template>
  <div class="container">
    <h1>Bitcoin Price Tracker</h1>
    <div class="chart-wrapper"><PriceChart /></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import PriceChart from "~/components/PriceChart.vue";

onMounted(() => {
  console.log("Page mounted");
});
</script>

<style scoped>
.container {
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.chart-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
