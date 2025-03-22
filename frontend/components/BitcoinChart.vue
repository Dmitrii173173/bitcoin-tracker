<template>
  <div class="chart-outer-container">
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-title">
          <h2>BTC/USDT</h2>
          <span class="price">{{ currentPrice.toFixed(2) }} USDT</span>
        </div>
        <div class="chart-controls">
          <button
            v-for="period in periods"
            :key="period"
            :class="['period-btn', { active: selectedPeriod === period }]"
            @click="changePeriod(period)"
          >
            {{ period }}
          </button>
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
const periods = ["1H", "24H", "7D", "1M"];
const selectedPeriod = ref("24H");

const mockData = Array.from({ length: 12 }, (_, i) => ({
  time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
  price: 41000 + Math.sin(i) * 500,
}));

const currentPrice = ref(mockData[0].price);

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

const changePeriod = (period: string) => {
  selectedPeriod.value = period;
};
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  min-height: 60px;
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

.chart-controls {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  padding: 2px;
}

.period-btn {
  background: transparent;
  border: none;
  color: #848e9c;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.period-btn.active {
  background: #1c2127;
  color: #f0b90b;
}

.period-btn:hover:not(.active) {
  color: #fff;
}

.chart-wrapper {
  height: 320px;
  position: relative;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
}
</style>
