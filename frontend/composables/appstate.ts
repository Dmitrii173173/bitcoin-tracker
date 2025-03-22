import { useMarketStore } from '~/stores/marketStore'

// Эта функция помогает гарантировать, что хранилище инициализировано
export default function useAppState() {
  const store = useMarketStore()
  return { store }
} 