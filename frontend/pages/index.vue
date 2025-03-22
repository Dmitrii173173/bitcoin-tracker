<template>
  <div class="page-container">
    <div class="charts-grid">
      <!-- Mock Data Chart -->
      <div class="chart-container">
        <div class="content-wrapper">
          <div class="stats-panel">
            <h3>Market Statistics (Mock)</h3>
            <div class="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Open</th>
                    <th>Close</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in tableData"
                    :key="row.date"
                    :class="{
                      positive: row.isPositive,
                      negative: !row.isPositive,
                    }"
                  >
                    <td>{{ formatDate(row.date) }}</td>
                    <td>${{ formatNumber(row.open) }}</td>
                    <td>${{ formatNumber(row.close) }}</td>
                    <td>${{ formatNumber(row.high) }}</td>
                    <td>${{ formatNumber(row.low) }}</td>
                    <td>
                      <div
                        class="volume-bar"
                        :style="{ width: `${row.volumePercentage}%` }"
                      >
                        {{ formatNumber(row.volume) }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="chart-section">
            <div class="header-row">
              <div class="price-header">
                <h2>BTC/USDT</h2>
                <div class="price-value">
                  ${{ formatNumber(mockCurrentData?.close || 0) }}
                  <span
                    :class="[
                      'change-badge',
                      mockPriceChange >= 0 ? 'positive' : 'negative',
                    ]"
                  >
                    {{ mockPriceChange >= 0 ? "+" : "" }}{{ mockPriceChange }}%
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
              <canvas ref="mockChartRef"></canvas>
              <canvas ref="mockVolumeChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Coindesk Data Chart -->
      <div class="chart-container">
        <div class="content-wrapper">
          <div class="stats-panel">
            <h3>Market Statistics (Coindesk)</h3>
            <div v-if="!coindeskLoading">
              <div class="stat-row">
                <span class="stat-label">Current Price</span>
                <span class="stat-value"
                  >${{ formatNumber(coindeskCurrentPrice) }}</span
                >
              </div>
              <div class="stat-row">
                <span class="stat-label">Last Updated</span>
                <span class="stat-value">{{
                  coindeskData?.time?.updated || "None"
                }}</span>
              </div>
            </div>
            <div v-else>Loading...</div>
          </div>

          <div class="chart-section">
            <div class="header-row">
              <div class="price-header">
                <h2>BTC/USD (Coindesk)</h2>
                <div class="price-value">
                  ${{ formatNumber(coindeskCurrentPrice) }}
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
              <canvas ref="coindeskChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useHistoricalData } from "~/composables/useHistoricalData";
import { useCoindeskData } from "~/composables/useCoindeskData";
import "chartjs-adapter-date-fns";

const mockChartRef = ref<HTMLCanvasElement | null>(null);
const mockVolumeChartRef = ref<HTMLCanvasElement | null>(null);
const coindeskChartRef = ref<HTMLCanvasElement | null>(null);
let mockChart: any = null;
let mockVolumeChart: any = null;
let coindeskChart: any = null;

const {
  data: mockData,
  currentData: mockCurrentData,
  priceChange: mockPriceChange,
  getCandlestickData,
  getTableData,
} = useHistoricalData();
const {
  data: coindeskData,
  historicalData: coindeskHistoricalData,
  loading: coindeskLoading,
  currentPrice: coindeskCurrentPrice,
  fetchCurrentPrice,
  fetchHistoricalData,
} = useCoindeskData();

const periods = [
  { label: "1D", value: "day" },
  { label: "1W", value: "week" },
  { label: "1M", value: "month" },
  { label: "1Y", value: "year" },
];

const selectedPeriod = ref("day");

const tableData = computed(() => getTableData());

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const createCandlestickChart = async (
  canvas: HTMLCanvasElement,
  volumeCanvas: HTMLCanvasElement,
  data: any
) => {
  const { default: Chart } = await import("chart.js/auto");

  // Создаем график свечей
  const candlestickChart = new Chart(canvas, {
    type: "candlestick",
    data: {
      datasets: [
        {
          label: "BTC/USDT",
          data: data.candlesticks,
          color: {
            up: "#34c759",
            down: "#ff3b30",
            unchanged: "#86868b",
          },
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
        },
        y: {
          position: "right",
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const point = context.raw;
              return [
                `Open: $${formatNumber(point.o)}`,
                `High: $${formatNumber(point.h)}`,
                `Low: $${formatNumber(point.l)}`,
                `Close: $${formatNumber(point.c)}`,
              ];
            },
          },
        },
      },
    },
  });

  // Создаем график объемов
  const volumeChart = new Chart(volumeCanvas, {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Volume",
          data: data.volumes,
          backgroundColor: data.volumes.map((v: any) => v.color),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          display: false,
        },
        y: {
          position: "left",
          grid: {
            display: false,
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

  return { candlestickChart, volumeChart };
};

const createChart = async (
  canvas: HTMLCanvasElement,
  data: any[],
  label: string
) => {
  const { default: Chart } = await import("chart.js/auto");

  return new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          label,
          data,
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
            callback: (value) => `$${formatNumber(value as number)}`,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `$${formatNumber(context.parsed.y)}`,
          },
        },
      },
    },
  });
};

const handlePeriodChange = async (period: string) => {
  selectedPeriod.value = period;

  // Обновляем оба графика
  if (mockChart) {
    const mockData = await fetchHistoricalData(period);
    mockChart.data.datasets[0].data = mockData;
    mockChart.update();
  }

  if (coindeskChart) {
    const coindeskData = await fetchHistoricalData(period);
    coindeskChart.data.datasets[0].data = coindeskData;
    coindeskChart.update();
  }
};

onMounted(async () => {
  await fetchCurrentPrice();

  if (mockChartRef.value && mockVolumeChartRef.value) {
    const data = getCandlestickData("day");
    const charts = await createCandlestickChart(
      mockChartRef.value,
      mockVolumeChartRef.value,
      data
    );
    mockChart = charts.candlestickChart;
    mockVolumeChart = charts.volumeChart;
  }

  if (coindeskChartRef.value) {
    const coindeskData = await fetchHistoricalData("day");
    coindeskChart = await createChart(
      coindeskChartRef.value,
      coindeskData,
      "BTC/USD"
    );
  }

  // Обновляем данные каждую минуту
  setInterval(async () => {
    await fetchCurrentPrice();
    handlePeriodChange(selectedPeriod.value);
  }, 60000);
});

// Следим за изменениями периодов
watch(selectedPeriod, handlePeriodChange);
</script>

<style scoped>
.page-container {
  padding: 24px;
  min-height: 100vh;
  background: var(--app-background);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 2400px;
  margin: 0 auto;
}

.chart-container {
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

.chart-wrapper {
  display: grid;
  grid-template-rows: 7fr 3fr;
  gap: 20px;
}

.timeframe-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.timeframe-buttons button {
  padding: 8px 16px;
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  background: transparent;
  color: var(--accent-color);
  cursor: pointer;
  transition: all 0.2s;
}

.timeframe-buttons button.active {
  background: var(--accent-color);
  color: white;
}

@media (max-width: 1600px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
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

.data-table {
  margin-top: 20px;
  overflow-y: auto;
  max-height: 400px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

th {
  font-weight: 600;
  color: var(--text-secondary);
  text-align: left;
}

td:first-child {
  text-align: left;
}

.volume-bar {
  background: var(--accent-color);
  opacity: 0.2;
  padding: 4px;
  border-radius: 4px;
  white-space: nowrap;
}

tr.positive td {
  color: #34c759;
}

tr.negative td {
  color: #ff3b30;
}
</style>
