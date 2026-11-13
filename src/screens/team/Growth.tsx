import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AssumptionKey } from '../../engine/assumptions';
import { cacPerActive, dropCostToBrand, growth, paybackMonths } from '../../engine/calc';
import { fmtINR, fmtINRExact, fmtInt, fmtMonths } from '../../engine/format';
import { useEngine } from '../../store/useLab';
import { AssumptionInput, chartTooltip, Kpi, StatusChip } from './parts';

const INPUTS: AssumptionKey[] = [
  'ambassadors',
  'ambassadorStipend',
  'signupsPerAmbassador',
  'activationRate',
  'inviteRate',
  'monthlyChurn',
  'affiliateCommission',
];

const axis = { fontSize: 11, fill: 'var(--muted)' };

export default function Growth() {
  const e = useEngine();
  const rows = growth(e.v);
  const last = rows[rows.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-extrabold">Growth model</h2>
        <StatusChip />
      </div>

      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Kpi label="Active earners · month 12" value={fmtInt(last.actives)} tone="brand" highlightKey="kpi-actives" />
        <Kpi label="CAC per active user" value={fmtINRExact(cacPerActive(e.v))} />
        <Kpi label="Margin per user / month" value={fmtINR(e.trip.margin)} sub={`Today: ${fmtINR(e.today.margin)}`} />
        <Kpi label="Payback" value={fmtMonths(paybackMonths(e.v))} sub="months" highlightKey="kpi-payback" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
            <span className="font-semibold">Active earners by month</span>
            <span className="flex items-center gap-1.5 text-brand">
              <i className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" /> Campus
            </span>
            <span className="flex items-center gap-1.5 text-pink">
              <i className="inline-block h-2.5 w-2.5 rounded-sm bg-pink" /> Invites
            </span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="rgb(var(--ink-rgb) / 0.06)" vertical={false} />
                <XAxis dataKey="t" tick={axis} tickLine={false} axisLine={{ stroke: 'rgb(var(--ink-rgb) / 0.15)' }} />
                <YAxis tick={axis} tickFormatter={(n: number) => fmtInt(n)} tickLine={false} axisLine={false} width={52} />
                <Tooltip
                  {...chartTooltip}
                  cursor={{ fill: 'rgb(var(--ink-rgb) / 0.04)' }}
                  formatter={(n: number, name: string) => [fmtInt(n), name === 'campusActives' ? 'From campus' : 'From invites']}
                  labelFormatter={(t) => `Month ${t}`}
                />
                <Bar dataKey="campusActives" stackId="a" fill="var(--brand)" isAnimationActive={false} />
                <Bar dataKey="inviteActives" stackId="a" fill="var(--brand-pink)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-4">
          <p className="mb-2 text-[12px] font-semibold">
            Monthly margin (₹) · {fmtINR(last.monthlyMargin)} in month 12
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="rgb(var(--ink-rgb) / 0.06)" vertical={false} />
                <XAxis dataKey="t" tick={axis} tickLine={false} axisLine={{ stroke: 'rgb(var(--ink-rgb) / 0.15)' }} />
                <YAxis tick={axis} tickFormatter={(n: number) => fmtINR(n)} tickLine={false} axisLine={false} width={68} />
                <Tooltip
                  {...chartTooltip}
                  cursor={{ fill: 'rgb(var(--ink-rgb) / 0.04)' }}
                  formatter={(n: number) => [fmtINR(n), 'Margin']}
                  labelFormatter={(t) => `Month ${t}`}
                />
                <Bar dataKey="monthlyMargin" fill="var(--brand-orange)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <p className="rounded-card bg-peach p-3.5 text-[13px] font-medium">
        Drops are funded by brands, so they do not reduce Onpoint's margin. (Drop cost to the brand: {fmtINR(dropCostToBrand(e.v))} per user per month.)
      </p>

      <section className="card p-4">
        <p className="label mb-1">Inputs</p>
        <div className="grid gap-x-8 md:grid-cols-2 xl:grid-cols-3">
          {INPUTS.map((k) => (
            <AssumptionInput key={k} k={k} />
          ))}
        </div>
      </section>
    </div>
  );
}
