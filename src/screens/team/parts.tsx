import type { ReactNode } from 'react';
import { SourceTag } from '../../components/SourceTag';
import { ASSUMPTIONS, type Assumption, type AssumptionKey } from '../../engine/assumptions';
import { fmtAssumption } from '../../engine/format';
import { useLab, valuesOf } from '../../store/useLab';

/** One adjustable assumption: label, source tag, slider and number field. */
export function AssumptionInput({ k }: { k: AssumptionKey }) {
  const a: Assumption = ASSUMPTIONS[k];
  const overrides = useLab((s) => s.assumptionOverrides);
  const setAssumption = useLab((s) => s.setAssumption);
  const value = valuesOf(overrides)[k];
  const pct = a.unit === 'pct';
  const scale = pct ? 100 : 1;
  const custom = k in overrides;
  const set = (n: number) => {
    if (!Number.isFinite(n)) return;
    setAssumption(k, Math.max(a.min ?? -Infinity, Math.min(a.max ?? Infinity, n)));
  };
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`in-${k}`} className="text-[13px] font-medium">
          {a.label}
        </label>
        <SourceTag tag={a.tag} />
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <input
          id={`in-${k}`}
          type="range"
          min={a.min}
          max={a.max}
          step={a.step}
          value={value}
          onChange={(e) => set(Number(e.target.value))}
          className="min-w-0 flex-1"
        />
        <span className="flex items-center gap-1">
          <input
            type="number"
            aria-label={a.label}
            min={(a.min ?? 0) * scale}
            max={(a.max ?? 0) * scale}
            step={(a.step ?? 1) * scale}
            value={Number((value * scale).toFixed(2))}
            onChange={(e) => set(Number(e.target.value) / scale)}
            className={`w-[76px] rounded-lg border bg-white px-2 py-1 text-right text-[13px] font-semibold outline-none focus:border-brand ${
              custom ? 'border-orange' : 'border-ink/[0.12]'
            }`}
          />
          <span className="w-3 text-[12px] text-muted">{pct ? '%' : a.unit === 'x' ? 'x' : ''}</span>
        </span>
      </div>
      {custom && <p className="mt-1 text-[11px] text-orange">Custom · deck value {fmtAssumption(k, a.value)}</p>}
    </div>
  );
}

export function Kpi({
  label,
  value,
  sub,
  tone = 'plain',
  highlightKey,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: 'plain' | 'brand' | 'muted';
  highlightKey?: string;
}) {
  const on = useLab((s) => s.highlight) === highlightKey && !!highlightKey;
  const tones = {
    plain: 'bg-white border-ink/[0.08]',
    brand: 'bg-brand text-white border-brand',
    muted: 'bg-white border-ink/[0.08] text-muted',
  };
  return (
    <div
      className={`rounded-card border p-3.5 transition-shadow duration-300 ${tones[tone]}`}
      style={on ? { boxShadow: '0 0 0 4px var(--brand-orange)' } : undefined}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${tone === 'brand' ? 'text-white/70' : 'text-muted'}`}>{label}</p>
      <p className="mt-1 font-display text-[26px] font-extrabold leading-none">{value}</p>
      {sub && <p className={`mt-1 text-[11px] ${tone === 'brand' ? 'text-white/70' : 'text-muted'}`}>{sub}</p>}
    </div>
  );
}

export function StatusChip() {
  const overrides = useLab((s) => s.assumptionOverrides);
  const destinationId = useLab((s) => s.destinationId);
  const reset = useLab((s) => s.resetAssumptions);
  const matches = Object.keys(overrides).length === 0 && destinationId === 'kasol';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${matches ? 'bg-brand/10 text-brand' : 'bg-orange/10 text-orange'}`}>
        {matches ? 'Matches deck' : 'Custom values'}
      </span>
      <button
        onClick={reset}
        disabled={matches}
        className="rounded-full border border-ink/[0.12] bg-white px-3 py-1 text-[12px] font-semibold disabled:opacity-40"
      >
        Reset to deck values
      </button>
    </div>
  );
}

export const chartTooltip = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid rgb(var(--ink-rgb) / 0.1)',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums' as const,
  },
};
