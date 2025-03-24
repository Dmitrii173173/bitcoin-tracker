<template>
  <div class="container">
    <div class="section">
      <h2 class="section-title">Bitcoin Price (Binance)</h2>

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>

      <!-- Индикатор ошибок -->
      <div v-else-if="error" class="error-container">
        <p>Ошибка: {{ error }}</p>
        <button @click="fetchData" class="refresh-button">
          Попробовать снова
        </button>
      </div>

      <!-- Основной контент -->
      <div v-else class="content-wrapper">
        <!-- График цены Bitcoin -->
        <div class="chart-container">
          <div class="chart-header"><h3>BTC/USDT Price</h3></div>

          <!-- График -->
          <ClientOnly>
            <canvas v-if="priceData.length" ref="chartRef"></canvas>
            <div v-else class="chart-placeholder">
              <p>Нет данных для отображения</p>
            </div>
          </ClientOnly>
        </div>

        <!-- Таблица данных -->
        <div class="data-table">
          <h3>Price History</h3>
          <table>
            <thead>
              <tr>
                <th>Время</th>
                <th>Цена (USDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in priceData.slice(0, 10)" :key="item.id">
                <td>{{ formatDate(item.timestamp) }}</td>
                <td>{{ formatPrice(item.price) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Кнопка обновления данных -->
          <button @click="fetchData" class="refresh-button">
            Обновить данные
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";

// Состояние
const loading = ref(false);
const error = ref(null);
const priceData = ref([]);
const chartRef = ref(null);
let priceChart = null;

// Получение данных
async function fetchData() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("/api/prices");
    if (!response.ok) throw new Error("Ошибка получения данных");
    priceData.value = await response.json();
    recreateChart();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Создание/пересоздание графика
function recreateChart() {
  if (priceChart) {
    priceChart.destroy();
  }

  if (!chartRef.value || priceData.value.length === 0) return;

  const ctx = chartRef.value.getContext("2d");

  // Подготовка данных для графика
  const labels = priceData.value.map((item) => formatDate(item.timestamp));
  const prices = priceData.value.map((item) => item.price);

  // Создание графика
  priceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "BTC/USDT",
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
              return value.toLocaleString() + " USDT";
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
              return context.raw.toLocaleString() + " USDT";
            },
          },
        },
      },
    },
  });
}

// Хелперы форматирования
function formatDate(date) {
  return new Date(date).toLocaleString();
}

function formatPrice(price) {
  return price.toLocaleString() + " USDT";
}

// Инициализация
onMounted(() => {
  fetchData();
  // Обновляем данные каждую минуту
  setInterval(fetchData, 60 * 1000);
});
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
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2d3748;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7fafc;
  border-radius: 4px;
  color: #718096;
}

.data-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.loading-container {
  padding: 40px;
  text-align: center;
  color: #718096;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3e98c7;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.error-container {
  padding: 20px;
  text-align: center;
  color: #e53e3e;
}

.refresh-button {
  background-color: #3e98c7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #2c7ab0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
