<template>
  <div class="container">
    <div class="section">
      <h2 class="section-title">Bitcoin Price (Binance)</h2>

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
        <!-- Свечной график -->
        <CandlestickChart
          :data="store.getCandlesByTimeframe(store.selectedTimeframe)"
          @timeframe-change="handleTimeframeChange"
        />

        <!-- Текущая цена -->
        <div class="current-price">
          <h3>Текущая цена</h3>
          <div class="price-info">
            <span class="price">{{
              formatPrice(store.getLatestCandle?.close || 0)
            }}</span>
            <span class="symbol">USDT</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useCandleStore } from "~/stores/candleStore";
import CandlestickChart from "~/components/CandlestickChart.vue";

const store = useCandleStore();

function formatPrice(price) {
  return price.toLocaleString();
}

function handleTimeframeChange(timeframe) {
  store.setTimeframe(timeframe);
}

function refreshData() {
  store.fetchCandles(store.selectedTimeframe);
}

onMounted(() => {
  store.fetchCandles();
  // Обновляем данные каждую минуту
  setInterval(() => {
    store.fetchCandles(store.selectedTimeframe);
  }, 60 * 1000);
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  background-color: #1e222d;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.section-title {
  background-color: #2a2e39;
  padding: 15px 20px;
  margin: 0;
  font-size: 18px;
  color: #fff;
  border-bottom: 1px solid #363a45;
}

.content-wrapper {
  padding: 20px;
}

.current-price {
  margin-top: 20px;
  padding: 15px;
  background-color: #2a2e39;
  border-radius: 4px;
}

.current-price h3 {
  margin: 0 0 10px 0;
  color: #787b86;
  font-size: 14px;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.symbol {
  color: #787b86;
  font-size: 14px;
}

.loading-container {
  padding: 40px;
  text-align: center;
  color: #787b86;
}

.loading-spinner {
  border: 3px solid #2a2e39;
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
  color: #ef5350;
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
