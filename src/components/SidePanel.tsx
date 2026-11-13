import { Suspense, lazy } from 'react';
import Story from '../screens/team/Story';
import { useLab, type PanelTab } from '../store/useLab';
import { Disclaimer } from './Disclaimer';
import { WingMark } from './ui';

// Charts are heavy, so the Team view tabs load only when opened.
const Calculator = lazy(() => import('../screens/team/Calculator'));
const Growth = lazy(() => import('../screens/team/Growth'));
const Assumptions = lazy(() => import('../screens/team/Assumptions'));

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'story', label: 'Story' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'growth', label: 'Growth' },
  { id: 'assumptions', label: 'Assumptions' },
];

export function SidePanel() {
  const tab = useLab((s) => s.panelTab);
  const setTab = useLab((s) => s.setPanelTab);
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-ink/[0.08] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <WingMark size={18} />
          </span>
          <div>
            <p className="font-display text-[18px] font-extrabold leading-none">Onpoint Trip Lab</p>
            <p className="mt-1 text-[11px] text-muted">Concept prototype · Ascend 3.0</p>
          </div>
        </div>
        <nav className="flex gap-1 rounded-full border border-ink/[0.1] bg-white p-1" aria-label="Side panel">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-demo={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${tab === t.id ? 'bg-ink text-white' : 'text-muted'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <Suspense fallback={<p className="text-[13px] text-muted">Loading…</p>}>
          {tab === 'story' && <Story />}
          {tab === 'calculator' && <Calculator />}
          {tab === 'growth' && <Growth />}
          {tab === 'assumptions' && <Assumptions />}
        </Suspense>
      </div>
      <Disclaimer className="shrink-0 border-t border-ink/[0.06] !pb-3 !pt-3" />
    </div>
  );
}
