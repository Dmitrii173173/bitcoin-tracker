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
                :class="{ active: mockTimeframe === period.value }"
                @click="mockTimeframe = period.value"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <ClientOnly>
            <canvas v-if="mockData.length" ref="mockChartRef"></canvas>
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredMockData" :key="index">
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
          <button @click="generateMockData" class="refresh-button">
            Обновить данные
          </button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Coindesk Data</h2>
      <div class="content-wrapper">
        <div class="chart-container">
          <div class="chart-header">
            <h3>BTC/USD (Coindesk)</h3>
            <div class="timeframe-selector">
              <button
                v-for="period in timeframes"
                :key="period.value"
                :class="{ active: coindeskTimeframe === period.value }"
                @click="coindeskTimeframe = period.value"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <ClientOnly>
            <canvas v-if="coindeskData.length" ref="coindeskChartRef"></canvas>
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
              <tr v-for="(item, index) in filteredCoindeskData" :key="index">
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
          <button @click="fetchCoindeskData" class="refresh-button">
            Обновить данные
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";

// Отказываемся от использования Pinia
const mockData = ref([]);
const coindeskData = ref([]);
const loading = ref(false);

// Таймфреймы
const mockTimeframe = ref("day");
const coindeskTimeframe = ref("day");

// Ссылки на графики
const mockChartRef = ref(null);
const coindeskChartRef = ref(null);
let mockChart = null;
let coindeskChart = null;

// Таймфреймы для выбора
const timeframes = [
  { label: "День", value: "day" },
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year" },
];

// Фильтрованные данные по таймфрейму
const filteredMockData = computed(() => {
  return filterDataByTimeframe(mockData.value, mockTimeframe.value);
});

const filteredCoindeskData = computed(() => {
  return filterDataByTimeframe(coindeskData.value, coindeskTimeframe.value);
});

// Фильтрация данных по таймфрейму
function filterDataByTimeframe(data, timeframe) {
  if (!data.length) return [];

  const now = new Date();
  let startDate = new Date();

  switch (timeframe) {
    case "day":
      startDate.setDate(now.getDate() - 1);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return data.filter((item) => new Date(item.date) >= startDate);
}

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

// Обновленная функция создания графика
function createChart(canvas, data, label) {
  if (!canvas) return null;

  // Создаем цвета для баров на основе open/close соотношения
  const colors = data.map((item) =>
    item.close >= item.open ? "#02C076" : "#F6465D"
  );

  return new Chart(canvas, {
    type: "bar", // изменяем тип на bar вместо candlestick
    data: {
      datasets: [
        {
          label: label,
          data: data.map((item) => ({
            x: new Date(item.date),
            y: [item.open, item.high, item.low, item.close], // все значения для OHLC
          })),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const values = context.raw.y;
              return [
                `Открытие: $${values[0].toFixed(2)}`,
                `Максимум: $${values[1].toFixed(2)}`,
                `Минимум: $${values[2].toFixed(2)}`,
                `Закрытие: $${values[3].toFixed(2)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: timeframeToTimeUnit(mockTimeframe.value),
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        y: {
          position: "right",
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            callback: (value) => `$${value.toFixed(2)}`,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
      parsing: {
        xAxisKey: "x",
        yAxisKey: "y[3]", // отображаем цену закрытия на основной оси
      },
    },
  });
}

// Преобразование таймфрейма в единицу времени для графика
function timeframeToTimeUnit(timeframe) {
  switch (timeframe) {
    case "day":
      return "hour";
    case "week":
      return "day";
    case "month":
      return "day";
    case "year":
      return "month";
    default:
      return "day";
  }
}

// Обновленная функция для наблюдения за изменениями данных
watch(
  [filteredMockData, mockTimeframe],
  () => {
    if (mockChart) {
      const colors = filteredMockData.value.map((item) =>
        item.close >= item.open ? "#02C076" : "#F6465D"
      );

      mockChart.data.datasets[0].data = filteredMockData.value.map((item) => ({
        x: new Date(item.date),
        y: [item.open, item.high, item.low, item.close],
      }));

      mockChart.data.datasets[0].backgroundColor = colors;
      mockChart.data.datasets[0].borderColor = colors;

      mockChart.options.scales.x.time.unit = timeframeToTimeUnit(
        mockTimeframe.value
      );
      mockChart.update();
    }
  },
  { deep: true }
);

// Аналогично обновляем функцию наблюдения за coindeskData
watch(
  [filteredCoindeskData, coindeskTimeframe],
  () => {
    if (coindeskChart) {
      const colors = filteredCoindeskData.value.map((item) =>
        item.close >= item.open ? "#02C076" : "#F6465D"
      );

      coindeskChart.data.datasets[0].data = filteredCoindeskData.value.map(
        (item) => ({
          x: new Date(item.date),
          y: [item.open, item.high, item.low, item.close],
        })
      );

      coindeskChart.data.datasets[0].backgroundColor = colors;
      coindeskChart.data.datasets[0].borderColor = colors;

      coindeskChart.options.scales.x.time.unit = timeframeToTimeUnit(
        coindeskTimeframe.value
      );
      coindeskChart.update();
    }
  },
  { deep: true }
);

// Генерация Mock данных
function generateMockData() {
  try {
    const data = [];
    const now = new Date();

    data.push({
      date: new Date("2025-02-20"),
      open: 30149.2,
      close: 28568.72,
      high: 31010.27,
      low: 27905.33,
      volume: 1744.95,
    });

    data.push({
      date: new Date("2025-02-21"),
      open: 44824.49,
      close: 46378.91,
      high: 47089.52,
      low: 44775.58,
      volume: 3165.6,
    });

    for (let i = 2; i < 24; i++) {
      const date = new Date(now.getTime() - (23 - i) * 3600000);
      const basePrice = 40000 + Math.random() * 2000;

      data.push({
        date,
        open: basePrice,
        high: basePrice + Math.random() * 200,
        low: basePrice - Math.random() * 200,
        close: basePrice + (Math.random() - 0.5) * 400,
        volume: Math.random() * 1000000,
      });
    }

    mockData.value = data;
  } catch (err) {
    console.error("Error generating mock data:", err);
  }
}

// Получение данных Coindesk
async function fetchCoindeskData() {
  try {
    loading.value = true;
    const response = await fetch(
      "https://api.coindesk.com/v1/bpi/currentprice.json"
    );
    const data = await response.json();

    const currentPrice = data.bpi.USD.rate_float;
    const now = new Date();

    const newDataPoint = {
      date: now,
      open: currentPrice * 0.999,
      high: currentPrice * 1.001,
      low: currentPrice * 0.998,
      close: currentPrice,
      volume: Math.random() * 1000000,
    };

    if (coindeskData.value.length === 0) {
      coindeskData.value = [newDataPoint];
    } else {
      coindeskData.value = [newDataPoint, ...coindeskData.value.slice(0, 23)];
    }
  } catch (err) {
    console.error("Error fetching Coindesk data:", err);
  } finally {
    loading.value = false;
  }
}

// Инициализация при монтировании
onMounted(() => {
  generateMockData();
  fetchCoindeskData();

  // Создаем графики после получения данных
  setTimeout(() => {
    if (mockChartRef.value && mockData.value.length) {
      mockChart = createChart(
        mockChartRef.value,
        filteredMockData.value,
        "BTC/USDT (Mock)"
      );
    }

    if (coindeskChartRef.value && coindeskData.value.length) {
      coindeskChart = createChart(
        coindeskChartRef.value,
        filteredCoindeskData.value,
        "BTC/USD (Coindesk)"
      );
    }
  }, 100);

  // Обновляем данные каждую минуту
  setInterval(() => {
    fetchCoindeskData();
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
