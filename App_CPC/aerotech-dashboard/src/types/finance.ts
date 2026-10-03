export type Value = number | string | null;
export type Row = Value[];
export interface Kpi {
  id: string;
  label: string;
  unit: string;
  reference: string;
  months: Value[];
  annual: Value;
}
export interface Section {
  id: string;
  label: string;
  kpis: Kpi[];
}
export interface SheetData {
  name: string;
  rows: Row[];
}
export interface FinanceModel {
  identity: Record<string, string>;
  title: string;
  controls: string[];
  sections: Section[];
  esg: Kpi[];
  cpc: Kpi[];
  balance: SheetData;
  dashboard: SheetData;
  sheets: SheetData[];
  warnings: string[];
  year: string;
}
export interface LocalFileHandle extends FileSystemFileHandle {
  queryPermission(descriptor: { mode: 'read' }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: 'read' }): Promise<PermissionState>;
}
declare global {
  interface Window {
    showOpenFilePicker?: (options: {
      multiple: boolean;
      types: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<LocalFileHandle[]>;
  }
}
export interface ParseRequest {
  id: number;
  buffer: ArrayBuffer;
}
export type ParseResponse =
  { id: number; model: FinanceModel } | { id: number; error: string };
