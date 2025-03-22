import { getCurrentInstance } from 'vue'

export function useStore() {
  const instance = getCurrentInstance()
  if (!instance) {
    // Возвращаем заглушку вместо реального хранилища
    return {
      mockData: [],
      coindeskData: [],
      loading: false,
      error: null,
      generateMockData: () => {},
      fetchCoindeskData: () => {}
    }
  }
  return {}
} 