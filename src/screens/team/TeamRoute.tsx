import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Screen } from '../../components/ui';
import { useMedia } from '../../hooks';
import { LAYOUT_PARAM, useLab, type PanelTab } from '../../store/useLab';
import Assumptions from './Assumptions';
import Calculator from './Calculator';
import Growth from './Growth';

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'calculator', label: 'Calculator' },
  { id: 'growth', label: 'Growth' },
  { id: 'assumptions', label: 'Assumptions' },
];

/** Team view as its own route on mobile. On desktop it lives in the side panel instead. */
export default function TeamRoute() {
  const wide = useMedia('(min-width: 900px)');
  const hasPanel = LAYOUT_PARAM ? LAYOUT_PARAM === 'landscape' : wide;
  const tab = useLab((s) => s.panelTab);
  const setTab = useLab((s) => s.setPanelTab);
  const active = tab === 'story' ? 'calculator' : tab;

  useEffect(() => {
    if (hasPanel && tab === 'story') setTab('calculator');
  }, [hasPanel, tab, setTab]);

  if (hasPanel) return <Navigate to="/profile" replace />;

  return (
    <Screen>
      <p className="label">For the Onpoint team</p>
      <div className="flex gap-1 rounded-full border border-ink/[0.1] bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={active === t.id}
            className={`flex-1 rounded-full py-1.5 text-[12.5px] font-semibold ${active === t.id ? 'bg-ink text-white' : 'text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {active === 'calculator' && <Calculator />}
      {active === 'growth' && <Growth />}
      {active === 'assumptions' && <Assumptions />}
    </Screen>
  );
}
