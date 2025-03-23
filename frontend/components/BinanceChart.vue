import { defineComponent, onMounted, ref, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import 'chartjs-chart-financial';

Chart.register(...registerables);

export default defineComponent({
  props: {
    chartData: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const createChart = () => {
      if (!chartCanvas.value) return;

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(chartCanvas.value, {
        type: 'candlestick',
        data: {
          datasets: [
            {
              label: 'Candlestick Chart',
              data: props.chartData,
              borderColor: '#009688',
              color: {
                up: 'green',
                down: 'red',
                unchanged: 'gray',
              },
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
              },
            },
            y: {
              beginAtZero: false,
            },
          },
        },
      });
    };

    watch(() => props.chartData, createChart, { deep: true });

    onMounted(createChart);

    return {
      chartCanvas,
    };
  },
});