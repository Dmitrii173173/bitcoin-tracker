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
defineProps<{
  title: string;
  data: any[];
  onRefresh: () => void;
}>();

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatVolume = (volume: number) => {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toString();
};

const getPriceClass = (current: number, reference: number) => {
  return current > reference
    ? "positive"
    : current < reference
    ? "negative"
    : "";
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

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
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

th,
td {
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

@media (max-width: 768px) {
  .table-wrapper {
    margin: 0 -20px;
  }

  table {
    font-size: 14px;
  }

  th,
  td {
    padding: 8px;
  }
}
</style>
