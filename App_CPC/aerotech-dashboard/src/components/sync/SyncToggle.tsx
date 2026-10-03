import { useFinanceStore } from '../../store/useFinanceStore';
export function SyncToggle({ toggle }: { toggle: () => void }) {
  const enabled = useFinanceStore((s) => s.enabled);
  return (
    <button
      className="toggle-row"
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
    >
      <span>Synchronisation Excel</span>
      <span className={'switch ' + (enabled ? 'on' : '')}>
        <i />
      </span>
    </button>
  );
}
