import { useEffect, useRef, useCallback } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import type {
  FinanceModel,
  LocalFileHandle,
  ParseResponse,
} from '../types/finance';
import { loadHandle, saveHandle } from '../lib/sync/fileHandleStore';
import { stamp, startSync, type Stamp } from '../lib/sync/excelSync';
export function useExcelSync() {
  const set = useFinanceStore((s) => s.set),
    enabled = useFinanceStore((s) => s.enabled);
  const worker = useRef<Worker | null>(null),
    handle = useRef<LocalFileHandle | null>(null),
    last = useRef<Stamp | null>(null),
    stop = useRef<(() => void) | null>(null),
    epoch = useRef(0),
    serial = useRef(0);
  const pending = useRef(
    new Map<
      number,
      {
        resolve: (m: FinanceModel) => void;
        reject: (e: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );
  const parse = useCallback(
    (buffer: ArrayBuffer) =>
      new Promise<FinanceModel>((resolve, reject) => {
        const id = ++serial.current;
        if (!worker.current) {
          reject(new Error('Lecteur Excel indisponible'));
          return;
        }
        const timer = setTimeout(() => {
          pending.current.delete(id);
          reject(new Error('Délai de lecture Excel dépassé'));
        }, 15000);
        pending.current.set(id, { resolve, reject, timer });
        worker.current.postMessage({ id, buffer }, [buffer]);
      }),
    [],
  );
  const read = useCallback(
    async (file: File, version: number) => {
      const model = await parse(await file.arrayBuffer());
      if (version !== epoch.current) return;
      model.warnings.forEach((warning) => console.warn(warning));
      const first = useFinanceStore.getState().model === null;
      const available = Array.from({ length: 12 }, (_, i) => i).filter((i) =>
        model.sections.some((s) =>
          s.kpis.some((k) => typeof k.months[i] === 'number'),
        ),
      );
      set({
        ...(first ? { period: available.at(-1) ?? 12 } : {}),
        model,
        updated: Date.now(),
        error: '',
        status: handle.current
          ? 'Fichier local lié'
          : 'Démonstration · aucun fichier lié',
      });
    },
    [parse, set],
  );
  useEffect(() => {
    const lifetime = epoch;
    const requests = pending.current;
    let disposed = false;
    const controller = new AbortController();
    worker.current = new Worker(
      new URL('../workers/parseWorkbook.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.current.onmessage = (e: MessageEvent<ParseResponse>) => {
      const item = pending.current.get(e.data.id);
      if (!item) return;
      clearTimeout(item.timer);
      pending.current.delete(e.data.id);
      if ('error' in e.data) item.reject(new Error(e.data.error));
      else item.resolve(e.data.model);
    };
    worker.current.onerror = () => {
      for (const item of pending.current.values()) {
        clearTimeout(item.timer);
        item.reject(new Error('Erreur du lecteur Excel'));
      }
      pending.current.clear();
    };
    void (async () => {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/Plan_Financier_AeroTech_Maroc.xlsx`,
          { signal: controller.signal },
        );
        if (!response.ok)
          throw new Error('Classeur de démonstration indisponible');
        const file = new File(
          [await response.arrayBuffer()],
          'Démonstration.xlsx',
        );
        await read(file, epoch.current);
        if (disposed) return;
        const saved = await loadHandle();
        if (disposed || !saved) return;
        handle.current = saved;
        set({ fileName: saved.name, status: 'Reconnecter le fichier' });
        const permission = await saved.queryPermission({ mode: 'read' });
        if (disposed) return;
        if (permission === 'granted') {
          const f = await saved.getFile();
          await read(f, epoch.current);
          last.current = stamp(f);
          set({ enabled: true });
        }
      } catch (e) {
        if (!disposed)
          set({ error: e instanceof Error ? e.message : 'Lecture impossible' });
      }
    })();
    return () => {
      disposed = true;
      controller.abort();
      lifetime.current++;
      stop.current?.();
      worker.current?.terminate();
      worker.current = null;
      for (const item of requests.values()) {
        clearTimeout(item.timer);
        item.reject(new Error('Lecture annulée'));
      }
      requests.clear();
    };
  }, [read, set]);
  useEffect(() => {
    stop.current?.();
    stop.current = null;
    if (!enabled || !handle.current) return;
    const version = epoch.current;
    stop.current = startSync(
      handle.current,
      last.current,
      async (f) => {
        if (version !== epoch.current) return;
        await read(f, version);
        last.current = stamp(f);
      },
      (e) => {
        set({
          error:
            e instanceof Error
              ? e.message
              : 'Fichier inaccessible. Reconnectez le fichier.',
        });
      },
    );
    return () => {
      stop.current?.();
      stop.current = null;
    };
  }, [enabled, read, set]);
  const link = async () => {
    try {
      if (!window.showOpenFilePicker) return;
      const [chosen] = await window.showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: 'Classeur Excel',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                ['.xlsx', '.xlsm'],
            },
          },
        ],
      });
      stop.current?.();
      epoch.current++;
      handle.current = chosen;
      set({ enabled: false, fileName: chosen.name });
      const f = await chosen.getFile();
      await read(f, epoch.current);
      last.current = stamp(f);
      try {
        await saveHandle(chosen);
      } catch {
        set({
          error:
            'Fichier lié, mais mémorisation impossible dans ce navigateur.',
        });
      }
      set({ enabled: true });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError'))
        set({ error: e instanceof Error ? e.message : 'Liaison impossible' });
    }
  };
  const reconnect = async () => {
    try {
      if (!handle.current) return;
      if (
        (await handle.current.requestPermission({ mode: 'read' })) !== 'granted'
      ) {
        set({ error: 'Autorisation de lecture refusée' });
        return;
      }
      const f = await handle.current.getFile();
      await read(f, epoch.current);
      last.current = stamp(f);
      set({ enabled: true });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Reliez le fichier Excel',
      });
    }
  };
  const upload = async (file: File) => {
    stop.current?.();
    epoch.current++;
    handle.current = null;
    set({ enabled: false, fileName: file.name });
    try {
      await read(file, epoch.current);
      set({ status: 'Import manuel · synchronisation indisponible' });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Import impossible' });
    }
  };
  const toggle = () => {
    if (enabled) {
      stop.current?.();
      epoch.current++;
      set({ enabled: false, status: 'Synchronisation en pause' });
    } else if (handle.current) {
      epoch.current++;
      set({ enabled: true, error: '' });
    } else
      set({ error: 'Liez un fichier Excel pour activer la synchronisation.' });
  };
  return { link, reconnect, upload, toggle };
}
