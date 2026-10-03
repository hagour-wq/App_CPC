import { useEffect, useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
export function SyncStatus() {
  const { enabled, status, updated } = useFinanceStore();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="sync-status">
      {enabled ? 'Active' : status}
      {updated && enabled
        ? ` · mise à jour il y a ${Math.max(0, Math.floor((now - updated) / 1000))} s`
        : ''}
    </p>
  );
}
