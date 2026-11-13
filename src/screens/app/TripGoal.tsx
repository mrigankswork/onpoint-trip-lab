import { Lock, LockOpen, Plane, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RouteLine } from '../../components/RouteLine';
import { Num, Screen } from '../../components/ui';
import { bluChips } from '../../engine/calc';
import { fmtINR, fmtInt, fmtMonths, fmtTripPct } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';

const FLIGHT_SAMPLE = 1000;

export default function TripGoal() {
  const e = useEngine();
  const navigate = useNavigate();
  const showToast = useLab((s) => s.showToast);
  // The Stay has its own screen. The other two answer in place.
  const open = (m: (typeof e.milestones)[number]) => {
    if (m.key === 'stay') navigate('/unlock');
    else if (m.unlocked) showToast(`${m.label} unlocked · worth ${fmtINR(m.cost)}`);
    else showToast(`${m.label} unlocks in ${fmtMonths(m.monthsToGo)} months at this pace`);
  };
  return (
    <Screen>
      <section className="rounded-card p-5 text-white" style={{ background: e.dest.gradient }}>
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-[24px] font-extrabold">{e.title}</h1>
          <span className="font-display text-[24px] font-extrabold text-unlock">
            <Num>{fmtTripPct(e.trip.percent)}</Num>
          </span>
        </div>
        <p className="text-[13px] text-white/80">
          <Num>{fmtINR(e.trip.balance)}</Num> of {fmtINR(e.cost)} · {fmtTripPct(e.trip.percent)} there
        </p>
        <div className="mt-2">
          <RouteLine percent={e.trip.percent} from={e.dest.fromCity} to={e.dest.name} />
        </div>
      </section>

      <section className="space-y-2.5">
        <p className="label">Three unlocks</p>
        {e.milestones.map((m) => (
          <button
            key={m.key}
            onClick={() => open(m)}
            className={`flex w-full items-center gap-3 rounded-card border p-4 text-left ${
              m.unlocked ? 'border-ink bg-unlock text-ink' : 'border-fg/[0.08] bg-surface'
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${m.unlocked ? 'bg-ink text-unlock' : 'bg-canvas text-muted'}`}>
              {m.unlocked ? <LockOpen size={18} /> : <Lock size={18} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[17px] font-bold">
                {m.label} · {fmtINR(m.cost)}
              </span>
              <span className={`block text-[12px] ${m.unlocked ? 'text-ink/70' : 'text-muted'}`}>{m.note}</span>
            </span>
            <span className="text-right text-[12px] font-semibold">
              {m.unlocked ? (
                'Unlocked'
              ) : (
                <>
                  <Num className="block font-display text-lg font-bold">{fmtMonths(m.monthsToGo)}</Num>
                  months to go
                </>
              )}
            </span>
          </button>
        ))}
      </section>

      <section className="card p-4">
        <p className="flex items-center gap-2 font-display text-[17px] font-bold">
          <Zap size={18} className="text-orange" /> Get there faster
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-[14px] bg-canvas p-3">
            <p className="text-[12px] text-muted">Without Drops</p>
            <p className="font-display text-2xl font-bold text-muted">{fmtMonths(e.trip.monthsTripNoDrops)}</p>
            <p className="text-[12px] text-muted">months to the whole trip</p>
          </div>
          <div className="rounded-[14px] bg-orange/10 p-3">
            <p className="text-[12px] font-semibold text-orange">With live Drops</p>
            <p className="font-display text-2xl font-bold">{fmtMonths(e.trip.monthsTrip)}</p>
            <p className="text-[12px] text-muted">months to the whole trip</p>
          </div>
        </div>
        <button onClick={() => navigate('/shop')} className="btn mt-3 w-full">
          See live Drops
        </button>
      </section>

      <p className="flex items-center justify-center gap-2 text-[12px] text-muted">
        <Plane size={14} /> Flying instead? {fmtInt(FLIGHT_SAMPLE)} Onpoints = {fmtInt(bluChips(e.v, FLIGHT_SAMPLE))} IndiGo BluChips
      </p>
    </Screen>
  );
}
