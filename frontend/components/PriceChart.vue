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

    <div class="chart-wrapper">
      <canvas ref="candlestickChart"></canvas>
      <canvas ref="volumeChart"></canvas>
    </div>

    <div v-if="hoveredData" class="tooltip">
      <div>Date: {{ formatDate(hoveredData.date) }}</div>
      <div>Open: ${{ formatNumber(hoveredData.open) }}</div>
      <div>High: ${{ formatNumber(hoveredData.high) }}</div>
      <div>Low: ${{ formatNumber(hoveredData.low) }}</div>
      <div>Close: ${{ formatNumber(hoveredData.close) }}</div>
      <div>Volume: {{ formatVolume(hoveredData.volume) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart, { CandlestickController, CandlestickElement } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

// Регистрируем поддержку candlestick
Chart.register(CandlestickController, CandlestickElement);

const props = defineProps<{
  title: string;
  data: any[];
  isMock?: boolean;
}>();

const candlestickChart = ref<HTMLCanvasElement | null>(null);
const volumeChart = ref<HTMLCanvasElement | null>(null);
const selectedTimeframe = ref('24H');
const hoveredData = ref(null);

const timeframes = [
  { label: '1H', value: '1H' },
  { label: '24H', value: '24H' },
  { label: '7D', value: '7D' },
  { label: '1M', value: '1M' }
];

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (date: Date) => {
  return date.toLocaleString();
};

const formatVolume = (volume: number) => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toString();
};

const createCharts = () => {
  if (!candlestickChart.value || !volumeChart.value) return;

  const candleCtx = candlestickChart.value.getContext('2d');
  const volumeCtx = volumeChart.value.getContext('2d');

  if (!candleCtx || !volumeCtx) return;

  const candleChart = new Chart(candleCtx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: props.title,
        data: props.data.map(item => ({
          x: new Date(item.date),
          o: item.open,
          h: item.high,
          l: item.low,
          c: item.close
        })),
        color: {
          up: '#34C759',
          down: '#FF3B30',
          unchanged: '#8E8E93'
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour'
          }
        },
        y: {
          position: 'right',
          title: {
            display: true,
            text: 'Price (USD)'
          }
        }
      }
    }
  });

  const volumeChart = new Chart(volumeCtx, {
    type: 'bar',
    data: {
      datasets: [{
        label: 'Volume',
        data: props.data.map(item => ({
          x: new Date(item.date),
          y: item.volume,
          color: item.close >= item.open ? '#34C759' : '#FF3B30'
        })),
        backgroundColor: (context: any) => {
          return context.raw?.color || '#8E8E93';
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: false
        },
        y: {
          position: 'left',
          title: {
            display: true,
            text: 'Volume'
          }
        }
      }
    }
  });

  return { candleChart, volumeChart };
};

const changeTimeframe = (timeframe: string) => {
  selectedTimeframe.value = timeframe;
  // Здесь добавить логику обновления данных в зависимости от таймфрейма
};

onMounted(() => {
  const charts = createCharts();

  // Сохраняем состояние в localStorage
  if (charts) {
    localStorage.setItem('chartState', JSON.stringify({
      timeframe: selectedTimeframe.value,
      lastUpdate: new Date().toISOString()
    }));
  }
});

// Восстанавливаем состояние при загрузке
const savedState = localStorage.getItem('chartState');
if (savedState) {
  const { timeframe } = JSON.parse(savedState);
  selectedTimeframe.value = timeframe;
}
</script>

<style scoped>
.chart-container {
  background: var(--card-background);
  border-radius: 16px;
  padding: 20px;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-wrapper {
  display: grid;
  grid-template-rows: 7fr 3fr;
  gap: 20px;
  height: calc(100% - 60px);
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

.tooltip {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 100;
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
