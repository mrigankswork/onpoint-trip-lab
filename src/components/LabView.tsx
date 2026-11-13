import { ArrowLeft } from 'lucide-react';
import { Suspense, lazy } from 'react';
import Story from '../screens/team/Story';
import { useLab, type PanelTab } from '../store/useLab';
import { Disclaimer } from './Disclaimer';
import { WingMark } from './ui';

// Charts are heavy, so these tabs load only when the Lab is opened.
const loadCalculator = () => import('../screens/team/Calculator');
const loadGrowth = () => import('../screens/team/Growth');
const loadAssumptions = () => import('../screens/team/Assumptions');
const Calculator = lazy(loadCalculator);
const Growth = lazy(loadGrowth);
const Assumptions = lazy(loadAssumptions);

/** Warm the Lab's chunks in the background so the switch feels instant. */
export const preloadLab = () => {
  loadCalculator();
  loadGrowth();
  loadAssumptions();
};

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'story', label: 'Story' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'growth', label: 'Growth' },
  { id: 'assumptions', label: 'Assumptions' },
];

/**
 * The Trip Lab: the story behind each screen and every number, traceable and adjustable.
 * `chrome` says what surrounds it: a desktop top bar, nothing (mobile, so it brings its
 * own back button), or the phone beside it (the landscape recording layout).
 */
export function LabView({ chrome }: { chrome: 'desktop' | 'mobile' | 'beside-phone' }) {
  const tab = useLab((s) => s.panelTab);
  const setTab = useLab((s) => s.setPanelTab);
  const setView = useLab((s) => s.setView);
  const mobile = chrome === 'mobile';
  return (
    <div className="flex h-full flex-col bg-canvas text-ink">
      <header className="shrink-0 border-b border-ink/[0.08] bg-canvas">
        <div className={`mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-2 ${mobile ? 'px-3 pb-2 pt-[max(10px,env(safe-area-inset-top))]' : 'px-6 py-3'}`}>
          {mobile ? (
            <button onClick={() => setView('app')} className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-[13px] font-semibold text-white">
              <ArrowLeft size={15} /> Back to the app
            </button>
          ) : (
            chrome === 'beside-phone' && (
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                  <WingMark size={18} />
                </span>
                <div>
                  <p className="font-display text-[18px] font-extrabold leading-none">Onpoint Trip Lab</p>
                  <p className="mt-1 text-[11px] text-muted">Concept prototype · Ascend 3.0</p>
                </div>
              </div>
            )
          )}
          {mobile && <p className="font-display text-[16px] font-extrabold">Trip Lab</p>}
          <nav
            aria-label="Trip Lab sections"
            className={`no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-ink/[0.1] bg-white p-1 ${mobile ? 'w-full' : ''}`}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                data-demo={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${mobile ? 'flex-1' : ''} ${
                  tab === t.id ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={`mx-auto w-full max-w-[1240px] ${mobile ? 'px-3 py-4' : 'px-6 py-5'}`}>
          <Suspense fallback={<p className="text-[13px] text-muted">Loading…</p>}>
            {tab === 'story' && <Story besidePhone={chrome === 'beside-phone'} />}
            {tab === 'calculator' && <Calculator />}
            {tab === 'growth' && <Growth />}
            {tab === 'assumptions' && <Assumptions />}
          </Suspense>
        </div>
        <Disclaimer className="!pb-4 !pt-2" />
      </div>
    </div>
  );
}
