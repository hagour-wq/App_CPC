import { get, set, del } from 'idb-keyval';
import type { LocalFileHandle } from '../../types/finance';
const key = 'aerotech-linked-file';
export const loadHandle = () => get<LocalFileHandle>(key);
export const saveHandle = (handle: LocalFileHandle) => set(key, handle);
export const deleteHandle = () => del(key);
