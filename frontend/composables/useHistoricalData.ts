import { ref, onMounted } from 'vue'
import bitcoinData from '../data/bitcoin_data.json'

export function useHistoricalData() {
  const data = ref(bitcoinData)
  
  const formattedData = computed(() => {
    return data.value.map(item => ({
      date: new Date(item.timestamp).getTime(),
      price: parseFloat(item.price)
    }))
  })

  return {
    data: formattedData
  }
} 