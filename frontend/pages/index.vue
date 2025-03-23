import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import Chart from "chart.js/auto";

const mockTimeframe = ref("day");
const coindeskTimeframe = ref("day");
const mockChartRef = ref(null);
const coindeskChartRef = ref(null);
let mockChart = null;
let coindeskChart = null;

function timeframeToTimeUnit(timeframe) {
  switch (timeframe) {
    case "week": return "week";
    case "month": return "month";
    case "year": return "year";
    default: return "day";
  }
}

const filteredMockData = computed(() => {
  const unit = timeframeToTimeUnit(mockTimeframe.value);
  return mockData.value.filter(item => item.timeframe === unit);
});

const filteredCoindeskData = computed(() => {
  const unit = timeframeToTimeUnit(coindeskTimeframe.value);
  return coindeskData.value.filter(item => item.timeframe === unit);
});

function createChart(canvas, data, label) {
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map(item => item.x),
      datasets: [{
        label,
        data: data.map(item => item.close),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { type: "category", title: { display: true, text: "Time" } },
        y: { title: { display: true, text: "Price" } },
      },
    },
  });
}

function updateChart(chart, data) {
  if (chart) {
    chart.data.labels = data.map(item => item.x);
    chart.data.datasets[0].data = data.map(item => item.close);
    chart.update();
  }
}

watch([filteredMockData, mockTimeframe], () => {
  if (mockChart) {
    updateChart(mockChart, filteredMockData.value);
  }
});

watch([filteredCoindeskData, coindeskTimeframe], () => {
  if (coindeskChart) {
    updateChart(coindeskChart, filteredCoindeskData.value);
  }
});

onMounted(() => {
  if (mockChartRef.value) {
    mockChart = createChart(mockChartRef.value, filteredMockData.value, "Mock BTC/USDT");
  }
  if (coindeskChartRef.value) {
    coindeskChart = createChart(coindeskChartRef.value, filteredCoindeskData.value, "Coindesk BTC/USD");
  }
});

onUnmounted(() => {
  if (mockChart) {
    mockChart.destroy();
    mockChart = null;
  }
  if (coindeskChart) {
    coindeskChart.destroy();
    coindeskChart = null;
  }
});
