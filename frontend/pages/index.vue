<template>
  <div>
    <h1>Курс биткоина</h1>
    <select v-model="period" @change="fetchData">
      <option value="day">День</option>
      <option value="week">Неделя</option>
      <option value="month">Месяц</option>
      <option value="year">Год</option>
    </select>
    <BitcoinChart :data="prices" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import BitcoinChart from "~/components/BitcoinChart.vue";

const period = ref("day");
const prices = ref([]);

const fetchData = async () => {
  prices.value = await $fetch(`/api/prices?period=${period.value}`);
};

onMounted(fetchData);
</script>
