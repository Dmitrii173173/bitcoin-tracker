<template>
  <div class="container">
    <div class="section">
      <h2 class="section-title">Mock Data</h2>
      <div class="content-wrapper">
        <ClientOnly>
          <div v-if="mockData.length" class="chart-placeholder">
            <p>Биткоин график загрузится в клиентском режиме</p>
          </div>
        </ClientOnly>
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
              <tr v-for="(item, index) in mockData" :key="index">
                <td>{{ new Date(item.date).toLocaleString() }}</td>
                <td>${{ item.open.toFixed(2) }}</td>
                <td>${{ item.high.toFixed(2) }}</td>
                <td>${{ item.low.toFixed(2) }}</td>
                <td>${{ item.close.toFixed(2) }}</td>
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
        <ClientOnly>
          <div v-if="coindeskData.length" class="chart-placeholder">
            <p>Coindesk график загрузится в клиентском режиме</p>
          </div>
        </ClientOnly>
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
              <tr v-for="(item, index) in coindeskData" :key="index">
                <td>{{ new Date(item.date).toLocaleString() }}</td>
                <td>${{ item.open.toFixed(2) }}</td>
                <td>${{ item.high.toFixed(2) }}</td>
                <td>${{ item.low.toFixed(2) }}</td>
                <td>${{ item.close.toFixed(2) }}</td>
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
import { ref, onMounted } from "vue";

// Отказываемся от использования Pinia
const mockData = ref([]);
const coindeskData = ref([]);
const loading = ref(false);

function formatVolume(volume) {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toString();
}

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

onMounted(() => {
  generateMockData();
  fetchCoindeskData();

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

.chart-placeholder {
  height: 300px;
  background: #1a1d20;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
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
