<template>
  <div class="price-container">
    <div class="content-wrapper">
      <div class="stats-panel">
        <h3>Market Statistics</h3>
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
import Chart from "chart.js/auto";

const { state, fetchPriceData } = useCoindeskData();
const currentPrice = computed(() => state.currentPrice);
const priceChange = computed(() => state.change);

let ChartInstance;
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
  if (!process.client || !chartRef.value || !ChartInstance) return;

  if (ChartInstance) {
    ChartInstance.destroy();
  }

  ChartInstance = new Chart(chartRef.value, {
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
          ticks: {
            callback: (value) => `$${value.toLocaleString()}`,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `$${context.parsed.y.toLocaleString()}`,
          },
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
    ChartInstance = module.default;
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
.price-container {
  background: var(--card-background);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-lg);
  height: 80vh;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: 100%;
}

.stats-panel {
  background: var(--blur-background);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(10px);
  height: fit-content;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.positive {
  color: #34c759;
}

.negative {
  color: #ff3b30;
}

.change-badge {
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 8px;
  margin-left: 12px;
}

.change-badge.positive {
  background: rgba(52, 199, 89, 0.1);
}

.change-badge.negative {
  background: rgba(255, 59, 48, 0.1);
}

.chart-section {
  flex: 1;
}

.price-header {
  margin-bottom: 24px;
}

h2 {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-weight: 600;
  font-size: 28px;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.price-value {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #007aff, #5856d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.timeframe-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: rgba(247, 248, 249, 0.7);
  padding: 8px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.timeframe-buttons button {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 12px;
  color: #007aff;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
}

.timeframe-buttons button:hover {
  background: rgba(0, 122, 255, 0.1);
}

.timeframe-buttons button.active {
  background: #007aff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.chart-wrapper {
  background: var(--blur-background);
  border-radius: 20px;
  padding: 24px;
  height: calc(100% - 100px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

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

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .price-value {
    font-size: 36px;
  }
}
</style>
