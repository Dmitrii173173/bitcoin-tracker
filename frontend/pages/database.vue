<template>
  <div class="database-page">
    <div class="header">
      <h1>Данные из базы данных</h1>
      <button @click="refreshData" :disabled="loading" class="refresh-button">
        {{ loading ? "Загрузка..." : "Обновить данные" }}
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="loading" class="loading">Загрузка данных...</div>

    <div v-else-if="dbData" class="data-container">
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Дата</th>
              <th>Цена</th>
              <th>Источник</th>
              <th>Создано</th>
              <th>Обновлено</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dbData" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ formatDate(row.timestamp) }}</td>
              <td>${{ formatNumber(row.price) }}</td>
              <td>{{ row.source }}</td>
              <td>{{ formatDate(row.created_at) }}</td>
              <td>{{ formatDate(row.updated_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="stats-panel">
        <h3>Статистика</h3>
        <div class="stat-row">
          <span class="stat-label">Всего записей</span>
          <span class="stat-value">{{ dbData.length }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Последнее обновление</span>
          <span class="stat-value">{{ getLastUpdate() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useApiData } from "~/composables/useApiData";

const { dbData, loading, error, fetchDatabaseData } = useApiData();

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const getLastUpdate = () => {
  if (!dbData.value || dbData.value.length === 0) return "Нет данных";
  const dates = dbData.value.map((row) => new Date(row.updated_at));
  const lastDate = new Date(Math.max(...dates));
  return lastDate.toLocaleString();
};

const refreshData = () => {
  fetchDatabaseData();
};

onMounted(() => {
  fetchDatabaseData();
});
</script>

<style scoped>
.database-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.refresh-button {
  padding: 12px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.data-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.data-table {
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}

.stats-panel {
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  height: fit-content;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

th {
  font-weight: 600;
  color: var(--text-secondary);
}

.error-message {
  padding: 16px;
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border-radius: 8px;
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
}

@media (max-width: 1024px) {
  .data-container {
    grid-template-columns: 1fr;
  }
}
</style>
