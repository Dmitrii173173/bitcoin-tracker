<template>
  <div>
    <div class="header">
      <h2>
        Bitcoin Price:
        {{ currentPrice ? `$${currentPrice.toFixed(2)}` : "Loading..." }}
      </h2>
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
    </div>

    <div class="chart-container">
      <Suspense>
        <template #default>
          <div v-if="chartReady">
            <Line v-if="hasData" :data="chartData" :options="chartOptions" />
            <div v-else class="status-message">No data available</div>
          </div>
        </template>
        <template #fallback>
          <div class="status-message">Loading chart...</div>
        </template>
      </Suspense>
    </div>

    <div class="footer">
      <span v-if="lastUpdateTime" class="last-update">
        Last updated: {{ lastUpdateTime }}
      </span>
      <button class="refresh-btn" @click="refreshData" :disabled="loading">
        {{ loading ? "Updating..." : "Refresh" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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

const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;

const periods = ["day", "week", "month", "year"];
const currentPeriod = ref("day");
const prices = ref([]);
const loading = ref(false);
const chartReady = ref(false);
const lastUpdateTime = ref("");
const currentPrice = ref(null);

const hasData = computed(() => prices.value.length > 0);

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Bitcoin Price (USD)",
      data: [],
      borderColor: "#2196f3",
      backgroundColor: "rgba(33, 150, 243, 0.1)",
      tension: 0.1,
      fill: true,
    },
  ],
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

async function fetchPrices(period) {
  if (loading.value) return;

  loading.value = true;
  try {
    const response = await useFetch(
      `${backendUrl}/api/prices?period=${period}`
    );
    const data = response.data.value;

    if (data && data.length > 0) {
      prices.value = data;
      currentPrice.value = data[data.length - 1].price;
      updateChart();
      lastUpdateTime.value = new Date().toLocaleString();
    }
  } catch (err) {
    console.error("Error fetching prices:", err);
  } finally {
    loading.value = false;
  }
}

function updateChart() {
  if (!hasData.value) return;

  chartData.value = {
    labels: prices.value.map((p) => new Date(p.timestamp).toLocaleTimeString()),
    datasets: [
      {
        ...chartData.value.datasets[0],
        data: prices.value.map((p) => p.price),
      },
    ],
  };
}

function changePeriod(period) {
  currentPeriod.value = period;
  refreshData();
}

async function refreshData() {
  await fetchPrices(currentPeriod.value);
}

// Инициализация после монтирования компонента
onMounted(async () => {
  chartReady.value = true;
  await fetchPrices("day");
});

// Удалите или закомментируйте строку
// const { data } = await useFetch(`${backendUrl}/api/prices`)
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button.active {
  background-color: #2196f3;
  color: white;
  border-color: #2196f3;
}

.chart-container {
  height: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-message {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.last-update {
  color: #666;
  font-size: 0.9em;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.refresh-btn:not(:disabled):hover {
  background-color: #45a049;
}
</style>
