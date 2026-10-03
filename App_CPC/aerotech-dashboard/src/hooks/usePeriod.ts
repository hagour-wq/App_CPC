import { useFinanceStore } from '../store/useFinanceStore';
export function usePeriod() {
  const period = useFinanceStore((s) => s.period),
    set = useFinanceStore((s) => s.set);
  return { period, select: (period: number) => set({ period }) };
}
