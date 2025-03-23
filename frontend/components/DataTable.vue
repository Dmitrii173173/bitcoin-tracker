<template>
  <div class="data-table">
    <div class="table-header">
      <h3>{{ title }}</h3>
      <button @click="onRefresh" class="refresh-button">Обновить</button>
    </div>
    <div class="table-wrapper">
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
          <tr v-for="item in data" :key="item.date">
            <td>{{ formatDate(item.date) }}</td>
            <td :class="getPriceClass(item.open, item.close)">
              ${{ formatNumber(item.open) }}
            </td>
            <td>${{ formatNumber(item.high) }}</td>
            <td>${{ formatNumber(item.low) }}</td>
            <td :class="getPriceClass(item.close, item.open)">
              ${{ formatNumber(item.close) }}
            </td>
            <td>{{ formatVolume(item.volume) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

type DataItem = {
  date: string | number | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

defineProps<{ 
  title: string; 
  data: DataItem[];
  onRefresh: () => void;
}>();

const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatNumber = (value: number): string => {
  return value.toFixed(2);
};

const formatVolume = (volume: number): string => {
  return volume >= 1_000_000 ? `${(volume / 1_000_000).toFixed(2)}M` :
         volume >= 1_000 ? `${(volume / 1_000).toFixed(2)}K` :
         volume.toString();
};

const getPriceClass = (current: number, reference: number): string => {
  return current > reference ? 'positive' : current < reference ? 'negative' : '';
};
</script>

<style scoped>
.data-table {
  background: #1a1d20;
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.refresh-button {
  padding: 8px 16px;
  background: #2c3035;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover {
  background: #3a3f45;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.positive {
  color: #02c076;
}

.negative {
  color: #f6465d;
}
</style>
