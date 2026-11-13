import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SourceTag } from '../../components/SourceTag';
import { destinations } from '../../data/destinations';
import type { AssumptionKey, DestinationId } from '../../engine/assumptions';
import { balance, tripCost } from '../../engine/calc';
import { fmtINR, fmtMonths } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';
import { AssumptionInput, chartTooltip, Kpi, StatusChip } from './parts';

const INPUTS: AssumptionKey[] = [
  'routedSpendToday',
  'baseRate',
  'spendLift',
  'dropsShare',
  'dropsMultiplier',
  'welcomeBonus',
  'referralBonus',
  'friendsJoined',
];

export default function Calculator() {
  const e = useEngine();
  const destinationId = useLab((s) => s.destinationId);
  const setDestination = useLab((s) => s.setDestination);
  const stay = e.dest.pieces.stay;

  const data = Array.from({ length: 13 }, (_, m) => ({
    m,
    today: balance(e.v, 'today', m),
    trip: balance(e.v, 'trip', m),
  }));

  // Where each line crosses each reference line (only if inside the 12-month window).
  const crossings = [
    { x: e.today.monthsStay, y: stay, c: 'var(--muted)' },
    { x: e.today.monthsTrip, y: e.cost, c: 'var(--muted)' },
    { x: e.trip.monthsStay, y: stay, c: 'var(--brand)' },
    { x: e.trip.monthsTrip, y: e.cost, c: 'var(--brand)' },
  ].filter((p) => p.x <= 12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-extrabold">Trip Calculator</h2>
        <StatusChip />
      </div>

      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Kpi label="Stay · Today" value="no goal" sub={`${fmtMonths(e.today.monthsStay)} months, if she knew`} tone="muted" />
        <Kpi label="Stay · With TRIP" value={fmtMonths(e.trip.monthsStay)} sub="months to first unlock" tone="brand" highlightKey="kpi-trip-stay" />
        <Kpi label="Whole trip · Today" value={fmtMonths(e.today.monthsTrip)} sub="months" tone="muted" highlightKey="kpi-today-trip" />
        <Kpi label="Whole trip · With TRIP" value={fmtMonths(e.trip.monthsTrip)} sub="months" tone="brand" highlightKey="kpi-trip-trip" />
      </div>

      <section className="card p-4">
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <span className="font-semibold">Cumulative balance by month (₹)</span>
          <span className="flex items-center gap-1.5 text-muted">
            <i className="inline-block h-[3px] w-4 rounded bg-muted" /> Today
          </span>
          <span className="flex items-center gap-1.5 text-brand">
            <i className="inline-block h-[3px] w-4 rounded bg-brand" /> With TRIP
          </span>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="rgb(var(--ink-rgb) / 0.06)" vertical={false} />
              <XAxis
                dataKey="m"
                type="number"
                domain={[0, 12]}
                ticks={[0, 2, 4, 6, 8, 10, 12]}
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                tickLine={false}
                axisLine={{ stroke: 'rgb(var(--ink-rgb) / 0.15)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                tickFormatter={(n: number) => fmtINR(n)}
                tickLine={false}
                axisLine={false}
                width={56}
                domain={[0, (max: number) => Math.max(max, e.cost * 1.1)]}
              />
              <Tooltip
                {...chartTooltip}
                formatter={(n: number, name: string) => [fmtINR(n), name === 'trip' ? 'With TRIP' : 'Today']}
                labelFormatter={(m) => `Month ${m}`}
              />
              <ReferenceLine y={stay} stroke="var(--brand-orange)" strokeDasharray="4 4" label={{ value: `Stay ${fmtINR(stay)}`, position: 'insideTopLeft', fontSize: 11, fill: 'var(--brand-orange)' }} />
              <ReferenceLine y={e.cost} stroke="var(--brand-pink)" strokeDasharray="4 4" label={{ value: `Whole trip ${fmtINR(e.cost)}`, position: 'insideTopLeft', fontSize: 11, fill: 'var(--brand-pink)' }} />
              <ReferenceLine x={e.month} stroke="rgb(var(--ink-rgb) / 0.35)" label={{ value: 'now', position: 'top', fontSize: 10, fill: 'var(--muted)' }} />
              <Line type="linear" dataKey="today" stroke="var(--muted)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="linear" dataKey="trip" stroke="var(--brand)" strokeWidth={3} dot={false} isAnimationActive={false} />
              {crossings.map((p, i) => (
                <ReferenceDot key={i} x={p.x} y={p.y} r={5} fill={p.c} stroke="#fff" strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-[11px] text-muted">
          Dots mark where each line crosses a goal. Today reaches the whole trip at month {fmtMonths(e.today.monthsTrip)}
          {e.today.monthsTrip > 12 ? ', off this chart' : ''}.
        </p>
      </section>

      <section className="card p-4">
        <p className="label mb-1">Inputs</p>
        <div className="grid gap-x-8 md:grid-cols-2">
          {INPUTS.map((k) => (
            <AssumptionInput key={k} k={k} />
          ))}
          <div className="py-2.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="in-destination" className="text-[13px] font-medium">
                Destination
              </label>
              <SourceTag tag="Team assumption" />
            </div>
            <select
              id="in-destination"
              value={destinationId}
              onChange={(ev) => setDestination(ev.target.value as DestinationId)}
              className="mt-1.5 w-full rounded-lg border border-ink/[0.12] bg-white px-2 py-1.5 text-[13px] font-semibold"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {fmtINR(tripCost(d.pieces))} per person
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}
