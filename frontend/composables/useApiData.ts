import { ref } from 'vue'

export function useApiData() {
  const dbData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchDatabaseData = async () => {
    try {
      loading.value = true
      const response = await fetch('/api/bitcoin-data')
      dbData.value = await response.json()
    } catch (e) {
      error.value = 'Ошибка при загрузке данных из базы'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    dbData,
    loading,
    error,
    fetchDatabaseData
  }
} 