import { describe, it, expect, vi } from 'vitest';
import { startSync } from '../lib/sync/excelSync';
import type { LocalFileHandle } from '../types/finance';
const file = (time: number) =>
  new File(['excel'], 'plan.xlsx', { lastModified: time });
describe('Synchronisation', () => {
  it('actualise après un changement puis arrête toute lecture', async () => {
    vi.useFakeTimers();
    let modified = 1;
    const getFile = vi.fn(async () => file(modified));
    const handle = { getFile } as unknown as LocalFileHandle;
    const accept = vi.fn(async () => {});
    const stop = startSync(handle, { modified: 1, size: 5 }, accept, vi.fn());
    await vi.advanceTimersByTimeAsync(1000);
    expect(accept).not.toHaveBeenCalled();
    modified = 2;
    await vi.advanceTimersByTimeAsync(1400);
    expect(accept).toHaveBeenCalledTimes(1);
    stop();
    const calls = getFile.mock.calls.length;
    await vi.advanceTimersByTimeAsync(5000);
    expect(getFile).toHaveBeenCalledTimes(calls);
    vi.useRealTimers();
  });
  it('réessaie une lecture verrouillée avec backoff', async () => {
    vi.useFakeTimers();
    const getFile = vi
      .fn()
      .mockResolvedValueOnce(file(2))
      .mockRejectedValueOnce(new Error('locked'))
      .mockResolvedValue(file(2));
    const accept = vi.fn(async () => {});
    const error = vi.fn();
    const stop = startSync(
      { getFile } as unknown as LocalFileHandle,
      { modified: 1, size: 5 },
      accept,
      error,
    );
    await vi.advanceTimersByTimeAsync(1700);
    expect(accept).toHaveBeenCalledOnce();
    expect(error).not.toHaveBeenCalled();
    stop();
    vi.useRealTimers();
  });
});
