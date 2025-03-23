import { useMarketStore } from '../stores/marketStore'

export default function useAppState() {
  const store = useMarketStore()
  return { store }
} 