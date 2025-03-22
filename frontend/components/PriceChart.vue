<template>
  <div class="chart-outer-container">
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-title">
          <h2>BTC/USDT</h2>
          <span class="price">{{ currentPrice.toFixed(2) }} USDT</span>
        </div>
      </div>
      <div class="chart-wrapper">
        <canvas ref="chartRef" height="400"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";

const chartRef = ref<HTMLCanvasElement | null>(null);
const chart = ref<Chart | null>(null);
const currentPrice = ref(41000);

const mockData = Array.from({ length: 12 }, (_, i) => ({
  time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
  price: 41000 + Math.sin(i) * 500,
}));

const createChart = () => {
  if (!chartRef.value) return;

  if (chart.value) {
    chart.value.destroy();
  }

  chart.value = new Chart(chartRef.value, {
    type: "line",
    data: {
      labels: mockData.map((d) => d.time).reverse(),
      datasets: [
        {
          data: mockData.map((d) => d.price).reverse(),
          borderColor: "#02C076",
          backgroundColor: "rgba(2, 192, 118, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: { display: false },
      },
    },
  });
};

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script>

<style scoped>
.chart-outer-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.chart-container {
  background-color: #0b0e11;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-wrapper {
  height: 320px;
  position: relative;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-title h2 {
  color: #fff;
  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

.price {
  color: #02c076;
  font-size: 24px;
  font-weight: 500;
}
</style>
