<template>
  <div class="data-table-container">
    <div class="table-header">
      <h2>{{ title }}</h2>
      <button @click="refreshData" class="refresh-btn">Обновить данные</button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Цена открытия</th>
          <th>Максимум</th>
          <th>Минимум</th>
          <th>Цена закрытия</th>
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
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  title: string;
  data: any[];
  onRefresh?: () => void;
}>();

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString();
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

const getPriceClass = (current: number, previous: number) => {
  return {
    "price-up": current > previous,
    "price-down": current < previous,
    "price-neutral": current === previous,
  };
};

const refreshData = () => {
  if (props.onRefresh) {
    props.onRefresh();
  }
};
</script>

<style scoped>
.data-table-container {
  background: var(--card-background);
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.refresh-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background: var(--background-secondary);
  font-weight: 600;
}

.price-up {
  color: #34c759;
}

.price-down {
  color: #ff3b30;
}

.price-neutral {
  color: #8e8e93;
}
</style>
