import { ref, computed } from 'vue'
import bitcoinData from '../../data/bitcoin_data.json'

export function useHistoricalData() {
  const data = ref(bitcoinData)
  
  const formattedData = computed(() => {
    return data.value.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.close
    }))
  })

  return {
    data: formattedData
  }
} 