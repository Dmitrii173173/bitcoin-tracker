<template>
  <div class="chart-container">
    <div class="chart-header">
      <h2>{{ title }}</h2>
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

    <div class="chart-wrapper"><canvas ref="chartRef"></canvas></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Регистрируем компоненты Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Tooltip,
  Legend
);

const props = defineProps<{
  title: string;
  data: any[];
  isMock: boolean;
}>();

const chartRef = ref<HTMLCanvasElement | null>(null);
const selectedTimeframe = ref("24H");
let chart: Chart | null = null;

const timeframes = [
  { label: "1H", value: "1H" },
  { label: "24H", value: "24H" },
  { label: "7D", value: "7D" },
  { label: "1M", value: "1M" },
];

const createChart = () => {
  if (!chartRef.value) return;

  const ctx = chartRef.value.getContext("2d");
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: props.title,
          data: props.data.map((item) => ({
            x: new Date(item.date),
            y: item.close,
          })),
          borderColor: "#007AFF",
          backgroundColor: "rgba(0, 122, 255, 0.1)",
          fill: true,
          tension: 0.4,
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
          time: {
            unit: "hour",
            displayFormats: {
              hour: "HH:mm",
              day: "MMM d",
              week: "MMM d",
              month: "MMM yyyy",
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          position: "right",
          title: {
            display: true,
            text: "Price (USD)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `$${context.parsed.y.toFixed(2)}`,
          },
        },
      },
    },
  });
};

const updateChart = () => {
  if (!chart) return;

  chart.data.datasets[0].data = props.data.map((item) => ({
    x: new Date(item.date),
    y: item.close,
  }));

  chart.update();
};

const changeTimeframe = (timeframe: string) => {
  selectedTimeframe.value = timeframe;
  // Здесь можно добавить логику фильтрации данных по временному интервалу
  updateChart();
};

watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

onMounted(() => {
  createChart();
});
</script>

<style scoped>
.chart-container {
  background: var(--card-background);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-wrapper {
  height: 400px;
  position: relative;
}

.timeframe-selector {
  display: flex;
  gap: 8px;
}

.timeframe-selector button {
  padding: 6px 12px;
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  background: transparent;
  color: var(--accent-color);
  cursor: pointer;
  transition: all 0.2s;
}

.timeframe-selector button.active {
  background: var(--accent-color);
  color: white;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 12px;
  }

  .timeframe-selector {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
