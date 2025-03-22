<template>
  <div class="container">
    <h1>Bitcoin Tracker</h1>
    <div class="chart-wrapper">
      <MockPrice />
      <CoindeskPrice />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import MockPrice from "~/components/MockPrice.vue";
import CoindeskPrice from "~/components/CoindeskPrice.vue";

onMounted(() => {
  console.log("Page mounted");
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
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
