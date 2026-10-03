import type { LocalFileHandle } from '../../types/finance';
export interface Stamp {
  modified: number;
  size: number;
}
export const stamp = (f: File): Stamp => ({
  modified: f.lastModified,
  size: f.size,
});
export const differs = (a: Stamp | null, b: Stamp) =>
  !a || a.modified !== b.modified || a.size !== b.size;
export function startSync(
  handle: LocalFileHandle,
  initial: Stamp | null,
  accept: (f: File) => Promise<void>,
  error: (e: unknown) => void,
) {
  let last = initial,
    busy = false,
    stopped = false;
  const waits = new Map<ReturnType<typeof setTimeout>, () => void>();
  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        waits.delete(id);
        resolve();
      }, ms);
      waits.set(id, resolve);
    });
  const tick = async () => {
    if (stopped || busy) return;
    busy = true;
    try {
      const f = await handle.getFile();
      if (stopped || !differs(last, stamp(f))) return;
      await delay(400);
      for (let attempt = 0; attempt < 4; attempt++) {
        if (stopped) return;
        try {
          const fresh = await handle.getFile();
          if (stopped) return;
          await accept(fresh);
          if (!stopped) last = stamp(fresh);
          break;
        } catch (e) {
          if (attempt === 3) throw e;
          await delay([300, 600, 1200][attempt]);
        }
      }
    } catch (e) {
      if (!stopped) error(e);
    } finally {
      busy = false;
    }
  };
  const interval = setInterval(() => void tick(), 1000);
  return () => {
    stopped = true;
    clearInterval(interval);
    for (const [id, resolve] of waits) {
      clearTimeout(id);
      resolve();
    }
    waits.clear();
  };
}
