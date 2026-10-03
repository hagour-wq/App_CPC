import { create } from 'zustand';
import type { FinanceModel } from '../types/finance';
interface State {
  model: FinanceModel | null;
  section: string;
  period: number;
  enabled: boolean;
  fileName: string;
  status: string;
  updated: number | null;
  error: string;
  set: (patch: Partial<State>) => void;
}
export const useFinanceStore = create<State>((set) => ({
  model: null,
  section: '1',
  period: 11,
  enabled: false,
  fileName: '',
  status: 'Démonstration · aucun fichier lié',
  updated: null,
  error: '',
  set: (patch) => set(patch),
}));
