<template>
  <div>
    <div class="controls">
      <button
        v-for="period in periods"
        :key="period"
        @click="changePeriod(period)"
        :class="{ active: currentPeriod === period }"
      >
        {{ period }}
      </button>
    </div>
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const periods = ["day", "week", "month", "year"];
const currentPeriod = ref("day");
const prices = ref([]);

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Bitcoin Price (USD)",
      data: [],
      borderColor: "#2196f3",
      tension: 0.1,
    },
  ],
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

async function fetchPrices(period) {
  try {
    const response = await fetch(`/api/prices?period=${period}`);
    prices.value = await response.json();
    updateChart();
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

function updateChart() {
  chartData.value.labels = prices.value.map((p) =>
    new Date(p.timestamp).toLocaleString()
  );
  chartData.value.datasets[0].data = prices.value.map((p) => p.price);
}

function changePeriod(period) {
  currentPeriod.value = period;
  fetchPrices(period);
}

onMounted(() => {
  fetchPrices("day");
});
</script>

<style scoped>
.controls {
  margin-bottom: 20px;
}
.controls button {
  margin-right: 10px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
.controls button.active {
  background-color: #2196f3;
  color: white;
}
.chart-container {
  height: 400px;
}
</style>
