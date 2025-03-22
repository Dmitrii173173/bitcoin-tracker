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
            <h2>BTC/USDT</h2>
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

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Chart from "chart.js/auto";
import { useHistoricalData } from "~/composables/useHistoricalData";

let Chart;

// Определяем переменные до использования browser API
const chartCanvas = ref(null);
let chart = null;
const selectedPeriod = ref("day");
const priceHistory = ref([]);
const currentPrice = ref(0);
const priceChange = ref(0);

const periods = [
  { label: "1D", value: "day" },
  { label: "1W", value: "week" },
  { label: "1M", value: "month" },
  { label: "1Y", value: "year" },
];

const updateChart = () => {
  if (!process.client || !chartCanvas.value) return;

  if (chart) {
    chart.destroy();
  }

  if (!Chart) return;

  chart = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels: priceHistory.value.map((p) => p.timestamp),
      datasets: [
        {
          label: "Price",
          data: priceHistory.value.map((p) => p.close),
          borderColor: "#007AFF",
          backgroundColor: "rgba(0, 122, 255, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          titleColor: "#1d1d1f",
          bodyColor: "#1d1d1f",
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: "600",
            family: "-apple-system",
          },
          bodyFont: {
            size: 13,
            family: "-apple-system",
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 12,
              family: "-apple-system",
            },
          },
        },
        y: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 12,
              family: "-apple-system",
            },
            callback: (value) => `$${value.toLocaleString()}`,
          },
        },
      },
    },
  });
};

if (process.client) {
  // Импортируем Chart.js только на клиенте
  import("chart.js/auto").then((module) => {
    Chart = module.default;
    // После импорта Chart.js инициализируем график
    if (chartCanvas.value) {
      updateChart();
    }
  });
}

onMounted(() => {
  if (process.client) {
    handlePeriodChange("day");
    setInterval(() => {
      if (selectedPeriod.value === "day") {
        handlePeriodChange("day");
      }
    }, 60000);
  }
});

// Остальные функции, не использующие browser API
const generateHistoricalData = (period) => {
  const now = new Date();
  const data = [];
  let timeInterval;
  let points;

  switch (period) {
    case "day":
      points = 24;
      timeInterval = 60 * 60 * 1000; // 1 час
      break;
    case "week":
      points = 7 * 24;
      timeInterval = 60 * 60 * 1000; // 1 час
      break;
    case "month":
      points = 30;
      timeInterval = 24 * 60 * 60 * 1000; // 1 день
      break;
    case "year":
      points = 365;
      timeInterval = 24 * 60 * 60 * 1000; // 1 день
      break;
    default:
      points = 24;
      timeInterval = 60 * 60 * 1000;
  }

  let basePrice = 50000;
  let lastClose = basePrice;

  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * timeInterval);
    const variation = basePrice * 0.02; // 2% вариация

    const trend = Math.random() > 0.5 ? 1 : -1;
    const open = lastClose;
    const close = open + trend * Math.random() * variation;
    const high = Math.max(open, close) + Math.random() * variation * 0.5;
    const low = Math.min(open, close) - Math.random() * variation * 0.5;
    const volume = Math.random() * 1000 + 500;

    lastClose = close;

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
};

const handlePeriodChange = (period) => {
  selectedPeriod.value = period;
  priceHistory.value = generateHistoricalData(period);
  if (process.client) {
    updateChart();
  }

  const latest = priceHistory.value[priceHistory.value.length - 1];
  const first = priceHistory.value[0];
  currentPrice.value = latest.close;
  priceChange.value = (
    ((latest.close - first.open) / first.open) *
    100
  ).toFixed(2);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const periodStats = computed(() => {
  const data = priceHistory.value;
  if (!data.length) return { high: 0, low: 0, volume: 0, change: 0 };

  const high = Math.max(...data.map((p) => p.high));
  const low = Math.min(...data.map((p) => p.low));
  const volume = data.reduce((sum, p) => sum + p.volume, 0);
  const change = (
    ((data[data.length - 1].close - data[0].open) / data[0].open) *
    100
  ).toFixed(2);

  return { high, low, volume, change };
});

// Инициализируем начальные данные
priceHistory.value = generateHistoricalData("day");
const latest = priceHistory.value[priceHistory.value.length - 1];
currentPrice.value = latest.close;
priceChange.value = 0;
</script>
