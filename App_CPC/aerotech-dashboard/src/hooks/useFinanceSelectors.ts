import { useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
export function useFinanceSelectors() {
  const model = useFinanceStore((s) => s.model),
    id = useFinanceStore((s) => s.section);
  return useMemo(
    () => ({
      model,
      section: model?.sections.find((s) => s.id === id),
      all: model?.sections.flatMap((s) => s.kpis) ?? [],
    }),
    [model, id],
  );
}
