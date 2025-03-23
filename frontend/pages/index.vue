<template>
  <div class="container">
    <div class="section">
      <h2 class="section-title">Mock Data</h2>
      <div class="content-wrapper">
        <div class="chart-container">
          <div class="chart-header">
            <h3>BTC/USDT (Mock)</h3>
            <div class="timeframe-selector">
              <button
                v-for="period in timeframes"
                :key="period.value"
                :class="{ active: selectedPeriod === period.value }"
                @click="selectedPeriod = period.value"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <ClientOnly>
            <canvas v-if="filteredData.length" ref="mockChartRef"></canvas>
            <div v-else class="chart-placeholder">
              <p>Нет данных для отображения</p>
            </div>
          </ClientOnly>
        </div>
        <div class="data-table">
          <h3>Mock Data Table</h3>
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Открытие</th>
                <th>Максимум</th>
                <th>Минимум</th>
                <th>Закрытие</th>
                <th>Объем</th>
                <th>Период</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredData" :key="index">
                <td>{{ new Date(item.date).toLocaleString() }}</td>
                <td :class="getColorClass(item.open, item.close)">
                  ${{ item.open.toFixed(2) }}
                </td>
                <td>${{ item.high.toFixed(2) }}</td>
                <td>${{ item.low.toFixed(2) }}</td>
                <td :class="getColorClass(item.close, item.open)">
                  ${{ item.close.toFixed(2) }}
                </td>
                <td>{{ formatVolume(item.volume) }}</td>
                <td>{{ item.period }}</td>
              </tr>
            </tbody>
          </table>
          <button @click="refreshMockData" class="refresh-button">
            Обновить данные
          </button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Coindesk Data</h2>
      <div class="content-wrapper">
        <div class="chart-container">
          <div class="chart-header"><h3>BTC/USD (Coindesk)</h3></div>
          <ClientOnly>
            <canvas
              v-if="store.coindeskData.length"
              ref="coindeskChartRef"
            ></canvas>
            <div v-else class="chart-placeholder">
              <p>Нет данных для отображения</p>
            </div>
          </ClientOnly>
        </div>
        <div class="data-table">
          <h3>Coindesk Data Table</h3>
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Открытие</th>
                <th>Максимум</th>
                <th>Минимум</th>
                <th>Закрытие</th>
                <th>Объем</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in store.coindeskData" :key="index">
                <td>{{ new Date(item.date).toLocaleString() }}</td>
                <td :class="getColorClass(item.open, item.close)">
                  ${{ item.open.toFixed(2) }}
                </td>
                <td>${{ item.high.toFixed(2) }}</td>
                <td>${{ item.low.toFixed(2) }}</td>
                <td :class="getColorClass(item.close, item.open)">
                  ${{ item.close.toFixed(2) }}
                </td>
                <td>{{ formatVolume(item.volume) }}</td>
              </tr>
            </tbody>
          </table>
          <button @click="refreshCoindeskData" class="refresh-button">
            Обновить данные
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Chart from "chart.js/auto";
import { useMarketStore } from "~/stores/marketStore";

// Хранилище данных
const store = useMarketStore();

// Выбранный период времени
const selectedPeriod = ref("day");

// Временные периоды для выбора
const timeframes = [
  { label: "День", value: "day" },
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year" },
];

// Фильтрация данных по периоду
const filteredData = computed(() => {
  if (!store.mockData.length) return [];
  return store.mockData.filter((item) => item.period === selectedPeriod.value);
});

// Ссылки на графики
const mockChartRef = ref(null);
const coindeskChartRef = ref(null);
let mockChart = null;
let coindeskChart = null;

// Форматирование объема
function formatVolume(volume) {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toString();
}

// Цветовой класс для изменения цены
function getColorClass(current, reference) {
  if (current > reference) return "positive";
  if (current < reference) return "negative";
  return "";
}

// Создание графика (упрощенная версия)
function createChart(canvas, data, label) {
  if (!canvas || !data.length) return null;

  return new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map((item) => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: "Цена закрытия",
          data: data.map((item) => item.close),
          borderColor: "#02C076",
          backgroundColor: "rgba(2, 192, 118, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const date = new Date(data[tooltipItems[0].dataIndex].date);
              return date.toLocaleDateString();
            },
            label: (context) => {
              const dataPoint = data[context.dataIndex];
              return [
                `Закрытие: $${dataPoint.close.toFixed(2)}`,
                `Открытие: $${dataPoint.open.toFixed(2)}`,
                `Максимум: $${dataPoint.high.toFixed(2)}`,
                `Минимум: $${dataPoint.low.toFixed(2)}`,
                `Объем: ${formatVolume(dataPoint.volume)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            callback: (value) => `$${value}`,
          },
        },
      },
    },
  });
}

// Обновление данных
function refreshMockData() {
  store.generateMockData();
  updateCharts();
}

function refreshCoindeskData() {
  store.fetchCoindeskData();
  updateCharts();
}

// Обновление графиков
function updateCharts() {
  // Уничтожаем старые графики если они есть
  if (mockChart) {
    mockChart.destroy();
    mockChart = null;
  }

  if (coindeskChart) {
    coindeskChart.destroy();
    coindeskChart = null;
  }

  // Создаем новые графики
  setTimeout(() => {
    if (mockChartRef.value && filteredData.value.length) {
      mockChart = createChart(
        mockChartRef.value,
        filteredData.value,
        "BTC/USDT (Mock)"
      );
    }

    if (coindeskChartRef.value && store.coindeskData.length) {
      coindeskChart = createChart(
        coindeskChartRef.value,
        store.coindeskData,
        "BTC/USD (Coindesk)"
      );
    }
  }, 0);
}

// Наблюдаем за изменением выбранного периода
watch(selectedPeriod, () => {
  updateCharts();
});

// Наблюдаем за изменением данных
watch(
  () => store.mockData,
  () => {
    updateCharts();
  },
  { deep: true }
);

// Инициализация при монтировании
onMounted(() => {
  store.generateMockData();
  store.fetchCoindeskData();

  // Создаем графики после получения данных
  setTimeout(() => {
    updateCharts();
  }, 100);

  // Обновляем данные каждую минуту
  setInterval(() => {
    store.fetchCoindeskData();
    updateCharts();
  }, 60000);
});
</script>

<style scoped>
.container {
  padding: 20px;
  background: #0b0e11;
  min-height: 100vh;
  color: white;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

.chart-container {
  background: #1a1d20;
  border-radius: 8px;
  padding: 20px;
  height: 450px;
  display: flex;
  flex-direction: column;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

canvas {
  flex: 1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
}

.timeframe-selector {
  display: flex;
  gap: 5px;
}

.timeframe-selector button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.timeframe-selector button.active {
  background: #02c076;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}

.data-table {
  background: #1a1d20;
  border-radius: 8px;
  padding: 20px;
}

.data-table h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: right;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  color: rgba(255, 255, 255, 0.7);
}

.positive {
  color: #02c076;
}

.negative {
  color: #f6465d;
}

.refresh-button {
  margin-top: 20px;
  background: #02c076;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

@media (min-width: 1200px) {
  .content-wrapper {
    flex-direction: row;
  }

  .content-wrapper > * {
    flex: 1;
  }
}
</style>
