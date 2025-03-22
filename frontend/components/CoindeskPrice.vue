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

        <div class="chart-wrapper">
          <div class="chart-container">
            <h2 class="chart-title">BTC/USD (Coindesk)</h2>
            <div class="price-chart"><canvas ref="chartRef" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useCoindeskData } from "~/composables/useCoindeskData";
import { useHistoricalData } from "~/composables/useHistoricalData";

const { state, fetchPriceData } = useCoindeskData();
const currentPrice = computed(() => state.currentPrice);
const priceChange = computed(() => state.change);

let Chart;
const chartRef = ref<HTMLCanvasElement | null>(null);
const { data } = useHistoricalData();
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
  if (!process.client || !chartRef.value || !Chart) return;

  if (Chart) {
    Chart.destroy();
  }

  Chart = new Chart(chartRef.value, {
    type: "line",
    data: {
      datasets: [
        {
          label: "BTC/USD",
          data: data.value,
          borderColor: "#007AFF",
          backgroundColor: "rgba(0, 122, 255, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
          grid: {
            display: false,
          },
        },
        y: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
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
    if (chartRef.value) {
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
.chart-container {
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px;
}

.price-chart {
  height: 300px;
  position: relative;
}
</style>
