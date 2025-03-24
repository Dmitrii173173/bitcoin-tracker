<template>
  <div class="candlestick-chart">
    <div class="chart-header">
      <div class="timeframe-selector">
        <button
          v-for="tf in timeframes"
          :key="tf.value"
          :class="{ active: selectedTimeframe === tf.value }"
          @click="changeTimeframe(tf.value)"
        >
          {{ tf.label }}
        </button>
      </div>
      <div class="chart-controls">
        <button @click="toggleFullscreen" class="control-button">
          <span class="icon">⛶</span>
        </button>
      </div>
    </div>

    <div class="chart-container" ref="chartContainer">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const chartRef = ref(null);
const chartContainer = ref(null);
let candlestickChart = null;

const timeframes = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1d", value: "1d" },
];

const selectedTimeframe = ref("1h");

function createCandlestickChart() {
  if (candlestickChart) {
    candlestickChart.destroy();
  }

  const ctx = chartRef.value.getContext("2d");

  // Подготовка данных для графика
  const chartData = props.data.map((candle) => ({
    x: new Date(candle.timestamp),
    o: candle.open,
    h: candle.high,
    l: candle.low,
    c: candle.close,
  }));

  candlestickChart = new Chart(ctx, {
    type: "candlestick",
    data: {
      datasets: [
        {
          label: "BTC/USDT",
          data: chartData,
          color: {
            up: "#26a69a",
            down: "#ef5350",
            unchanged: "#26a69a",
          },
          borderColor: {
            up: "#26a69a",
            down: "#ef5350",
            unchanged: "#26a69a",
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
            unit: getTimeUnit(selectedTimeframe.value),
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#787b86",
          },
        },
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#787b86",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const data = context.raw;
              return [
                `Открытие: ${data.o.toLocaleString()} USDT`,
                `Максимум: ${data.h.toLocaleString()} USDT`,
                `Минимум: ${data.l.toLocaleString()} USDT`,
                `Закрытие: ${data.c.toLocaleString()} USDT`,
              ];
            },
          },
        },
      },
    },
  });
}

function getTimeUnit(timeframe) {
  const units = {
    "1m": "minute",
    "5m": "minute",
    "15m": "minute",
    "1h": "hour",
    "4h": "hour",
    "1d": "day",
  };
  return units[timeframe];
}

function changeTimeframe(timeframe) {
  selectedTimeframe.value = timeframe;
  // Здесь можно добавить логику для получения новых данных
  createCandlestickChart();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    chartContainer.value.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Следим за изменениями данных
watch(
  () => props.data,
  () => {
    createCandlestickChart();
  },
  { deep: true }
);

onMounted(() => {
  createCandlestickChart();
});

onUnmounted(() => {
  if (candlestickChart) {
    candlestickChart.destroy();
  }
});
</script>

<style scoped>
.candlestick-chart {
  background-color: #1e222d;
  border-radius: 8px;
  padding: 16px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timeframe-selector {
  display: flex;
  gap: 8px;
}

.timeframe-selector button {
  background-color: #2a2e39;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  color: #787b86;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.timeframe-selector button:hover {
  background-color: #363a45;
}

.timeframe-selector button.active {
  background-color: #363a45;
  color: #fff;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.control-button {
  background-color: #2a2e39;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  color: #787b86;
  cursor: pointer;
  transition: all 0.2s;
}

.control-button:hover {
  background-color: #363a45;
}

.chart-container {
  flex: 1;
  position: relative;
  background-color: #1e222d;
  border-radius: 4px;
  overflow: hidden;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
