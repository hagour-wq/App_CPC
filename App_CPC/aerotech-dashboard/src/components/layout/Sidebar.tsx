import { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { fr } from '../../i18n/fr';
import { SyncToggle } from '../sync/SyncToggle';
import { SyncStatus } from '../sync/SyncStatus';
import { UploadButton } from '../sync/UploadButton';
import type { useExcelSync } from '../../hooks/useExcelSync';
export function Sidebar({ sync }: { sync: ReturnType<typeof useExcelSync> }) {
  const model = useFinanceStore((s) => s.model),
    section = useFinanceStore((s) => s.section),
    set = useFinanceStore((s) => s.set);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="mobile-menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>
      <aside className={'glass sidebar ' + (open ? 'open' : '')}>
        <a className="wordmark" href="#" aria-label="AéroTech, accueil">
          <span className="mark">A</span>
          <span>
            AéroTech<small>Finance & stratégie</small>
          </span>
        </a>
        <div className="menu-caption">Reporting financier</div>
        <nav aria-label="Sections financières">
          {fr.sections.map((label, i) => {
            const id = String(i + 1),
              exists = model?.sections.find((s) => s.id === id);
            return (
              <button
                title={exists?.label ?? label}
                key={id}
                aria-current={section === id ? 'page' : undefined}
                onClick={() => {
                  set({ section: id });
                  setOpen(false);
                }}
              >
                <span className="section-number">0{id}</span>
                <span className="nav-label">{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sync-panel">
          <SyncToggle toggle={sync.toggle} />
          <SyncStatus />
          <UploadButton {...sync} />
        </div>
        <div className="sidebar-foot">
          MAD · Référentiel CGNC
          <br />
          Données calculées par Excel
        </div>
      </aside>
    </>
  );
}
