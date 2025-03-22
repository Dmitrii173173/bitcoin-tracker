<template>
  <div class="binance-chart" :class="{ 'is-mock': isMock }">
    <div class="chart-header">
      <div class="price-info">
        <h3>{{ title }}</h3>
        <div class="current-price">
          <span class="price">${{ formatNumber(currentPrice) }}</span>
          <span
            class="change"
            :class="{
              positive: priceChange > 0,
              negative: priceChange < 0,
            }"
          >
            {{ priceChange > 0 ? "+" : "" }}{{ priceChange.toFixed(2) }}%
          </span>
        </div>
      </div>
      <div class="timeframe-selector">
        <button
          v-for="period in timeframes"
          :key="period.value"
          :class="{ active: selectedTimeframe === period.value }"
          @click="changeTimeframe(period.value)"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="candlestickRef"></canvas> <canvas ref="volumeRef"></canvas>

      <div v-if="hoveredData" class="tooltip" :style="tooltipStyle">
        <div class="tooltip-header">{{ formatDate(hoveredData.date) }}</div>
        <div class="tooltip-row">
          <span>O:</span>
          <span :class="getPriceClass(hoveredData.open, hoveredData.close)">
            {{ formatNumber(hoveredData.open) }}
          </span>
        </div>
        <div class="tooltip-row">
          <span>H:</span> <span>{{ formatNumber(hoveredData.high) }}</span>
        </div>
        <div class="tooltip-row">
          <span>L:</span> <span>{{ formatNumber(hoveredData.low) }}</span>
        </div>
        <div class="tooltip-row">
          <span>C:</span>
          <span :class="getPriceClass(hoveredData.close, hoveredData.open)">
            {{ formatNumber(hoveredData.close) }}
          </span>
        </div>
        <div class="tooltip-row">
          <span>Vol:</span> <span>{{ formatVolume(hoveredData.volume) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Tooltip
);

const props = defineProps<{
  title: string;
  data: any[];
  isMock: boolean;
}>();

const candlestickRef = ref<HTMLCanvasElement | null>(null);
const volumeRef = ref<HTMLCanvasElement | null>(null);
const selectedTimeframe = ref(localStorage.getItem("timeframe") || "24H");
const hoveredData = ref<any>(null);
const tooltipStyle = ref({
  top: "0px",
  left: "0px",
});

const timeframes = [
  { label: "1H", value: "1H" },
  { label: "24H", value: "24H" },
  { label: "7D", value: "7D" },
  { label: "1M", value: "1M" },
];

const currentPrice = computed(() => {
  if (!props.data.length) return 0;
  return props.data[0].close;
});

const priceChange = computed(() => {
  if (props.data.length < 2) return 0;
  const latest = props.data[0].close;
  const previous = props.data[1].close;
  return ((latest - previous) / previous) * 100;
});

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

const formatVolume = (volume: number) => {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toString();
};

const getPriceClass = (current: number, reference: number) => {
  return current > reference
    ? "positive"
    : current < reference
    ? "negative"
    : "";
};

let candlestickChart: Chart | null = null;
let volumeChart: Chart | null = null;

const createCharts = () => {
  if (!candlestickRef.value || !volumeRef.value) return;

  // Создаем график свечей
  candlestickChart = new Chart(candlestickRef.value, {
    type: "line",
    data: {
      datasets: [
        {
          label: props.title,
          data: props.data.map((item) => ({
            x: new Date(item.date),
            y: item.close,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          })),
          borderColor: "#02C076",
          backgroundColor: "rgba(2, 192, 118, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
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
      scales: {
        x: {
          type: "time",
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
          },
        },
        y: {
          position: "right",
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
          },
        },
      },
      plugins: {
        tooltip: {
          enabled: false,
          external: (context) => {
            const tooltipModel = context.tooltip;
            if (tooltipModel.opacity === 0) {
              hoveredData.value = null;
              return;
            }

            const position = context.chart.canvas.getBoundingClientRect();
            tooltipStyle.value = {
              top: `${position.top + tooltipModel.caretY}px`,
              left: `${position.left + tooltipModel.caretX + 10}px`,
            };

            const dataPoint = props.data[tooltipModel.dataPoints[0].dataIndex];
            hoveredData.value = dataPoint;
          },
        },
      },
    },
  });

  // Создаем график объема
  volumeChart = new Chart(volumeRef.value, {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Volume",
          data: props.data.map((item) => ({
            x: new Date(item.date),
            y: item.volume,
          })),
          backgroundColor: props.data.map((item) =>
            item.close >= item.open ? "#02C076" : "#F6465D"
          ),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: false,
        },
        y: {
          position: "left",
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
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

const updateCharts = () => {
  if (!candlestickChart || !volumeChart) return;

  candlestickChart.data.datasets[0].data = props.data.map((item) => ({
    x: new Date(item.date),
    y: item.close,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }));

  volumeChart.data.datasets[0].data = props.data.map((item) => ({
    x: new Date(item.date),
    y: item.volume,
  }));

  volumeChart.data.datasets[0].backgroundColor = props.data.map((item) =>
    item.close >= item.open ? "#02C076" : "#F6465D"
  );

  candlestickChart.update("none");
  volumeChart.update("none");
};

const changeTimeframe = (timeframe: string) => {
  selectedTimeframe.value = timeframe;
  localStorage.setItem("timeframe", timeframe);
};

watch(
  () => props.data,
  () => {
    updateCharts();
  },
  { deep: true }
);

onMounted(() => {
  createCharts();
});
</script>

<style scoped>
.binance-chart {
  background: #0b0e11;
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.price-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
}

.current-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  font-size: 24px;
  font-weight: 600;
}

.change {
  font-size: 14px;
}

.positive {
  color: #02c076;
}

.negative {
  color: #f6465d;
}

.timeframe-selector {
  display: flex;
  gap: 4px;
}

.timeframe-selector button {
  padding: 6px 12px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.timeframe-selector button.active {
  background: rgba(255, 255, 255, 0.2);
}

.chart-container {
  position: relative;
  height: 400px;
  display: grid;
  grid-template-rows: 7fr 3fr;
  gap: 20px;
}

.tooltip {
  position: fixed;
  background: rgba(11, 14, 17, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px;
  pointer-events: none;
  z-index: 100;
}

.tooltip-header {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .timeframe-selector {
    width: 100%;
    justify-content: space-between;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
