<template>
  <LineChart :chart-data="chartData" />
</template>

<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale
);

const props = defineProps(["data"]);

const chartData = computed(() => ({
  labels: props.data.map((p) => new Date(p.timestamp).toLocaleDateString()),
  datasets: [
    {
      label: "Цена BTC",
      data: props.data.map((p) => p.value),
      borderColor: "#ffcc00",
    },
  ],
}));
</script>
