import { fmtMonths } from '../engine/format';
import { useLab } from '../store/useLab';
import { Num } from './ui';

export function MonthSlider({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const month = useLab((s) => s.month);
  const setMonth = useLab((s) => s.setMonth);
  const sub = tone === 'dark' ? 'text-white/60' : 'text-muted';
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={`label ${sub}`}>Fast-forward time</span>
        <span className="font-display text-lg font-bold">
          Month <Num>{fmtMonths(month)}</Num>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={12}
        step={0.1}
        value={month}
        data-demo="month-slider"
        aria-label="Simulated month"
        onChange={(e) => setMonth(Number(e.target.value))}
        className="mt-2 w-full"
      />
      <div className={`mt-1 flex justify-between text-[11px] ${sub}`}>
        {[0, 3, 6, 9, 12].map((m) => (
          <button key={m} onClick={() => setMonth(m)} className="px-1">
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
