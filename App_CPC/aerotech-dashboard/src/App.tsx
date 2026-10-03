import { lazy, Suspense, useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useExcelSync } from './hooks/useExcelSync';
import { useFinanceSelectors } from './hooks/useFinanceSelectors';
import { useFinanceStore } from './store/useFinanceStore';
import { AnimatedLenses } from './components/layout/AnimatedLenses';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { KpiCard } from './components/kpi/KpiCard';
import { Gauge } from './components/kpi/Gauge';
import { fr } from './i18n/fr';
import { normalize } from './lib/parse/normalize';
const AnnualCharts = lazy(() => import('./components/charts/AnnualCharts'));
export default function App() {
  const sync = useExcelSync(),
    { model, section, all } = useFinanceSelectors();
  const period = useFinanceStore((s) => s.period),
    id = useFinanceStore((s) => s.section),
    set = useFinanceStore((s) => s.set),
    error = useFinanceStore((s) => s.error),
    updated = useFinanceStore((s) => s.updated);
  const reduced = useReducedMotion();
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        (e.target instanceof HTMLElement &&
          (/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName) ||
            e.target.isContentEditable))
      )
        return;
      const state = useFinanceStore.getState();
      if (/^[1-4]$/.test(e.key)) set({ section: e.key });
      else if (e.key === 'a' || e.key === 'A') set({ period: 12 });
      else if (e.key === 'ArrowRight') set({ period: (state.period + 1) % 13 });
      else if (e.key === 'ArrowLeft') set({ period: (state.period + 12) % 13 });
      else if (e.key === 'ArrowDown')
        set({ section: String((Number(state.section) % 4) + 1) });
      else if (e.key === 'ArrowUp')
        set({ section: String(((Number(state.section) + 2) % 4) + 1) });
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [set]);
  const gauges = useMemo(() => {
    const find = (text: string) =>
      all.find((k) => normalize(k.label).includes(normalize(text)));
    const items =
      id === '1'
        ? [[find("Marge d'exploitation"), 0.25]]
        : id === '2'
          ? [
              [find('Taux de croissance du résultat net'), 0.15],
              [find('CAF / CA'), 0.25],
            ]
          : id === '3'
            ? [
                [find('Poids du personnel dans la valeur ajoutée'), 1],
                [find('Taux de valeur ajoutée locale'), 0.6],
              ]
            : [
                [find('DSO'), 120],
                [find('CCC'), 120],
              ];
    return period < 12 ? items.slice(0, 1) : items;
  }, [all, id, period]);
  return (
    <>
      <AnimatedLenses />
      <Sidebar sync={sync} />
      <main>
        <Header />
        {error && (
          <div className="notice bad" role="alert">
            {error}
            <button
              onClick={() => set({ error: '' })}
              aria-label="Fermer l’erreur"
            >
              ×
            </button>
          </div>
        )}
        {model?.warnings.length ? (
          <details className="notice">
            <summary>{model.warnings.length} point(s) à vérifier</summary>
            {model.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </details>
        ) : null}
        <div className="section-heading">
          <div>
            <p>
              {period === 12
                ? (model?.year ?? 'Année')
                : `${fr.periods[period]} · ${model?.year.replace('Année ', '') ?? ''}`}
            </p>
            <h2>{fr.sections[Number(id) - 1]}</h2>
          </div>
          <span className="badge neutral">
            {section?.kpis.length ?? 0} indicateurs
          </span>
        </div>
        <AnimatePresence mode="sync">
          <motion.div
            key={id + period}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {!model ? (
              <p className="notice">Lecture du fichier de démonstration…</p>
            ) : !section ? (
              <p className="notice">Donnée absente : section {id}</p>
            ) : (
              <>
                <div className="gauge-grid">
                  {gauges.map(([k, max], i) => (
                    <Gauge
                      key={i}
                      kpi={typeof k === 'object' ? k : undefined}
                      max={typeof max === 'number' ? max : 1}
                      period={period}
                    />
                  ))}
                </div>
                <div className="kpi-grid">
                  {section.kpis.map((k) => (
                    <KpiCard key={k.id} kpi={k} period={period} />
                  ))}
                </div>
                {period === 12 && (
                  <Suspense
                    fallback={
                      <p className="notice">
                        Chargement des graphiques annuels…
                      </p>
                    }
                  >
                    <AnnualCharts model={model} />
                  </Suspense>
                )}
                <details className="source-details">
                  <summary>Consulter les onglets sources</summary>
                  {model.sheets.map((s) => (
                    <details key={s.name}>
                      <summary>
                        {s.name} · {s.rows.length} lignes
                      </summary>
                      <div className="table-scroll">
                        <table>
                          <tbody>
                            {s.rows
                              .filter((r) => r.some((v) => v !== null))
                              .map((row, i) => (
                                <tr key={i}>
                                  {row.map((v, j) => (
                                    <td key={j}>
                                      {typeof v === 'number'
                                        ? new Intl.NumberFormat('fr-MA', {
                                            maximumFractionDigits: 2,
                                          }).format(v)
                                        : v}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  ))}
                </details>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <footer>
          Source : Excel · Calculs conservés du classeur ·{' '}
          {model?.identity['Département'] ?? 'Finance'}
        </footer>
      </main>
      {updated && (
        <div className="update-toast" role="status" key={updated}>
          Mis à jour · {new Date(updated).toLocaleTimeString('fr-FR')}
        </div>
      )}
    </>
  );
}
