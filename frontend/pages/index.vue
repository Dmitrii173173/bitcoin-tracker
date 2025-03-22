<template>
  <div class="page-container">
    <div class="charts-grid">
      <!-- Левый график -->
      <div class="chart-container">
        <div class="content-wrapper">
          <div class="stats-panel">
            <h3>Market Statistics (Mock)</h3>
            <div class="stat-row">
              <span class="stat-label">24h High</span>
              <span class="stat-value positive"
                >${{ formatNumber(mockCurrentData?.high || 0) }}</span
              >
            </div>
            <div class="stat-row">
              <span class="stat-label">24h Low</span>
              <span class="stat-value negative"
                >${{ formatNumber(mockCurrentData?.low || 0) }}</span
              >
            </div>
            <div class="stat-row">
              <span class="stat-label">Volume</span>
              <span class="stat-value"
                >${{ formatNumber(mockCurrentData?.volume || 0) }}</span
              >
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
            </div>
            <div class="chart-wrapper">
              <canvas ref="mockChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Правый график -->
      <div class="chart-container">
        <div class="content-wrapper">
          <div class="stats-panel">
            <h3>Market Statistics (Coindesk)</h3>
            <div class="stat-row">
              <span class="stat-label">24h High</span>
              <span class="stat-value positive"
                >${{ formatNumber(coindeskCurrentData?.high || 0) }}</span
              >
            </div>
            <div class="stat-row">
              <span class="stat-label">24h Low</span>
              <span class="stat-value negative"
                >${{ formatNumber(coindeskCurrentData?.low || 0) }}</span
              >
            </div>
            <div class="stat-row">
              <span class="stat-label">Volume</span>
              <span class="stat-value"
                >${{ formatNumber(coindeskCurrentData?.volume || 0) }}</span
              >
            </div>
          </div>

          <div class="chart-section">
            <div class="header-row">
              <div class="price-header">
                <h2>BTC/USD (Coindesk)</h2>
                <div class="price-value">
                  ${{ formatNumber(coindeskCurrentData?.close || 0) }}
                  <span
                    :class="[
                      'change-badge',
                      coindeskPriceChange >= 0 ? 'positive' : 'negative',
                    ]"
                  >
                    {{ coindeskPriceChange >= 0 ? "+" : ""
                    }}{{ coindeskPriceChange }}%
                  </span>
                </div>
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
import { ref, onMounted } from "vue";
import { useHistoricalData } from "~/composables/useHistoricalData";
import "chartjs-adapter-date-fns"; // Добавляем адаптер для дат

const mockChartRef = ref<HTMLCanvasElement | null>(null);
const coindeskChartRef = ref<HTMLCanvasElement | null>(null);

const {
  data: mockData,
  currentData: mockCurrentData,
  priceChange: mockPriceChange,
} = useHistoricalData();
const {
  data: coindeskData,
  currentData: coindeskCurrentData,
  priceChange: coindeskPriceChange,
} = useHistoricalData();

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const createChart = (canvas: HTMLCanvasElement, data: any[], label: string) => {
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

onMounted(async () => {
  const { default: Chart } = await import("chart.js/auto");

  if (mockChartRef.value) {
    createChart(mockChartRef.value, mockData.value, "BTC/USDT");
  }

  if (coindeskChartRef.value) {
    createChart(coindeskChartRef.value, coindeskData.value, "BTC/USD");
  }
});
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
  background: var(--blur-background);
  border-radius: 20px;
  padding: 24px;
  height: calc(100% - 100px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
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
</style>
