<template>
  <div class="price-container">
    <div class="content-wrapper">
      <div class="stats-panel">
        <h3>Coindesk Statistics</h3>
        <div class="stat-row">
          <span class="stat-label">24h High</span>
          <span class="stat-value positive"
            >${{ formatNumber(periodStats.high) }}</span
          >
        </div>
        <div class="stat-row">
          <span class="stat-label">24h Low</span>
          <span class="stat-value negative"
            >${{ formatNumber(periodStats.low) }}</span
          >
        </div>
        <div class="stat-row">
          <span class="stat-label">Volume</span>
          <span class="stat-value"
            >${{ formatNumber(periodStats.volume) }}</span
          >
        </div>
        <div class="stat-row">
          <span class="stat-label">Change</span>
          <span
            :class="[
              'stat-value',
              periodStats.change >= 0 ? 'positive' : 'negative',
            ]"
          >
            {{ periodStats.change }}%
          </span>
        </div>
      </div>

      <div class="chart-section">
        <div class="header-row">
          <div class="price-header">
            <h2>BTC/USD (Coindesk)</h2>
            <div class="price-value">
              ${{ formatNumber(currentPrice) }}
              <span
                :class="[
                  'change-badge',
                  priceChange >= 0 ? 'positive' : 'negative',
                ]"
              >
                {{ priceChange >= 0 ? "+" : "" }}{{ priceChange }}%
              </span>
            </div>
          </div>

          <div class="timeframe-buttons">
            <button
              v-for="period in periods"
              :key="period.value"
              :class="{ active: selectedPeriod === period.value }"
              @click="handlePeriodChange(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <div class="chart-wrapper"><canvas ref="chartCanvas"></canvas></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useCoindeskData } from "~/composables/useCoindeskData";

const { state, fetchPriceData } = useCoindeskData();
const currentPrice = computed(() => state.currentPrice);
const priceChange = computed(() => state.change);

let Chart;
const chartCanvas = ref(null);
let chart = null;
const selectedPeriod = ref("day");

const periods = [
  { label: "1D", value: "day" },
  { label: "1W", value: "week" },
  { label: "1M", value: "month" },
  { label: "1Y", value: "year" },
];

const formatNumber = (num) => {
  if (!num) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const periodStats = computed(() => {
  return {
    high: state.high,
    low: state.low,
    volume: state.volume,
    change: state.change,
  };
});

const updateChart = () => {
  if (!process.client || !chartCanvas.value || !Chart) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels: state.priceHistory.map((p) => {
        const date = new Date(p.timestamp);
        return date.toLocaleTimeString();
      }),
      datasets: [
        {
          label: "BTC Price",
          data: state.priceHistory.map((p) => p.price),
          borderColor: "#007AFF",
          backgroundColor: "rgba(0, 122, 255, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => `$${value.toLocaleString()}`,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
};

const handlePeriodChange = (period) => {
  selectedPeriod.value = period;
  fetchPriceData(period);
  updateChart();
};

if (process.client) {
  import("chart.js/auto").then((module) => {
    Chart = module.default;
    if (chartCanvas.value) {
      updateChart();
    }
  });
}

onMounted(async () => {
  if (process.client) {
    await fetchPriceData("day");
    updateChart();

    setInterval(() => {
      fetchPriceData(selectedPeriod.value);
    }, 60000);
  }
});
</script>

<style scoped>
/* Те же стили, что и в MockPrice.vue */
</style>
