<template>
  <div class="container">
    <!-- Блок с данными из API/JSON -->
    <div class="section">
      <h2 class="section-title">Bitcoin Data</h2>

      <!-- Индикатор загрузки -->
      <div v-if="store.loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>

      <!-- Индикатор ошибок -->
      <div v-else-if="store.error" class="error-container">
        <p>Ошибка: {{ store.error }}</p>
        <button @click="refreshData" class="refresh-button">
          Попробовать снова
        </button>
      </div>

      <!-- Основной контент -->
      <div v-else class="content-wrapper">
        <!-- График цены Bitcoin -->
        <div class="chart-container">
          <div class="chart-header">
            <h3>BTC Price</h3>
            <div class="timeframe-selector">
              <button
                v-for="period in timeframes"
                :key="period.value"
                :class="{ active: selectedPeriod === period.value }"
                @click="changePeriod(period.value)"
              >
                {{ period.label }}
              </button>
            </div>
          </div>

          <!-- График -->
          <ClientOnly>
            <canvas v-if="store.mockData.length" ref="chartRef"></canvas>
            <div v-else class="chart-placeholder">
              <p>Нет данных для отображения</p>
            </div>
          </ClientOnly>
        </div>

        <!-- Таблица данных -->
        <div class="data-table">
          <h3>Price Data</h3>
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
              <tr
                v-for="(item, index) in filteredData.slice(0, 10)"
                :key="index"
              >
                <td>{{ formatDate(item.date) }}</td>
                <td :class="getColorClass(item.open, item.close)">
                  ${{ formatPrice(item.open) }}
                </td>
                <td>${{ formatPrice(item.high) }}</td>
                <td>${{ formatPrice(item.low) }}</td>
                <td :class="getColorClass(item.close, item.open)">
                  ${{ formatPrice(item.close) }}
                </td>
                <td>{{ formatVolume(item.volume) }}</td>
                <td>{{ item.period }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Кнопка обновления данных -->
          <button @click="refreshData" class="refresh-button">
            Обновить данные
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useMarketStore } from "~/stores/marketStore";
import Chart from "chart.js/auto";

// Инициализация хранилища
const store = useMarketStore();

// Состояние для графика
const chartRef = ref(null);
let priceChart = null;

// Выбранный период времени
const selectedPeriod = ref("day");
const timeframes = [
  { label: "День", value: "day" },
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year" },
];

// Получение отфильтрованных данных на основе выбранного периода
const filteredData = computed(() => {
  return store.mockData.filter((item) => item.period === selectedPeriod.value);
});

// Обработчик изменения периода
async function changePeriod(period) {
  selectedPeriod.value = period;
  await store.fetchHistoricalByPeriod(period);
  recreateChart();
}

// Обновление данных
async function refreshData() {
  await store.generateMockData();
  recreateChart();
}

// Создание/пересоздание графика
function recreateChart() {
  if (priceChart) {
    priceChart.destroy();
  }

  if (!chartRef.value || filteredData.value.length === 0) return;

  const ctx = chartRef.value.getContext("2d");

  // Подготовка данных для графика
  const labels = filteredData.value.map((item) => formatDate(item.date));
  const prices = filteredData.value.map((item) => item.close);

  // Создание графика
  priceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Цена закрытия",
          data: prices,
          borderColor: "#3E98C7",
          backgroundColor: "rgba(62, 152, 199, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            display: true,
            color: "rgba(200, 200, 200, 0.2)",
          },
          ticks: {
            callback: function(value) {
              return "$" + value.toLocaleString();
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return "$" + context.raw.toLocaleString();
            },
          },
        },
      },
    },
  });
}

// Хелперы форматирования
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function formatPrice(price) {
  return price.toFixed(2);
}

function formatVolume(volume) {
  return volume.toLocaleString();
}

function getColorClass(current, previous) {
  if (current > previous) return "positive";
  if (current < previous) return "negative";
  return "";
}

// Инициализация
onMounted(async () => {
  await refreshData();
});

// Отслеживание изменений данных
watch(() => store.mockData, recreateChart, { deep: true });
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.section-title {
  background-color: #f5f7fa;
  padding: 15px 20px;
  margin: 0;
  font-size: 18px;
  border-bottom: 1px solid #e3e8f0;
}

.content-wrapper {
  padding: 20px;
}

.chart-container {
  height: 400px;
  margin-bottom: 30px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.timeframe-selector button {
  background-color: #f5f7fa;
  border: 1px solid #e3e8f0;
  padding: 6px 12px;
  margin-right: 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.timeframe-selector button.active {
  background-color: #3e98c7;
  color: white;
  border-color: #3e98c7;
}

.timeframe-selector button:hover {
  background-color: #eaeef4;
}

.timeframe-selector button.active:hover {
  background-color: #3589b7;
}

.data-table {
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e3e8f0;
}

.data-table th {
  background-color: #f5f7fa;
  font-weight: 600;
}

.data-table tbody tr:hover {
  background-color: #f9fafc;
}

.positive {
  color: #4caf50;
}

.negative {
  color: #f44336;
}

.refresh-button {
  background-color: #3e98c7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #3589b7;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3e98c7;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f9fafc;
  border-radius: 8px;
  color: #8795a9;
}
</style>
