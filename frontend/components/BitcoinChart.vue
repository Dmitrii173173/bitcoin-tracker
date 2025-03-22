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
        <apexchart
          type="line"
          height="400"
          :options="chartOptions"
          :series="series"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";

const periods = ["1H", "24H", "7D", "1M"];
const selectedPeriod = ref("24H");

const mockData = Array.from({ length: 12 }, (_, i) => ({
  time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
  price: 41000 + Math.sin(i) * 500,
}));

const currentPrice = ref(mockData[0].price);

const chartOptions = {
  chart: {
    type: "line",
    height: 400,
    foreColor: "#848E9C",
    toolbar: { show: false },
    background: "transparent",
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  grid: {
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: { left: 10, right: 10 },
  },
  xaxis: {
    categories: mockData.map((d) => d.time).reverse(),
    labels: {
      style: { colors: "#848E9C" },
    },
  },
  yaxis: {
    labels: {
      style: { colors: "#848E9C" },
    },
  },
  tooltip: {
    theme: "dark",
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "vertical",
      opacityFrom: 0.5,
      opacityTo: 0,
    },
  },
};

const series = [
  {
    name: "BTC/USDT",
    data: mockData.map((d) => d.price).reverse(),
  },
];

const changePeriod = (period: string) => {
  selectedPeriod.value = period;
};
</script>

<style scoped>
.chart-outer-container {
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.chart-container {
  background-color: #0b0e11;
  border-radius: 8px;
  padding: 20px;
  height: 500px;
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
  flex: 1;
  height: calc(100% - 60px);
  min-height: 0;
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
