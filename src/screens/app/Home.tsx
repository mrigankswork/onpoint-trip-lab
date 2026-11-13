import { ChevronRight, FastForward, LockOpen, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DestinationArt } from '../../components/DestinationArt';
import { DropCard } from '../../components/DropCard';
import { ProgressBar } from '../../components/ProgressBar';
import { SquadStrip } from '../../components/SquadStrip';
import { Num, Screen } from '../../components/ui';
import { brandById, brands } from '../../data/brands';
import { tripPercent } from '../../engine/calc';
import { fmtINR, fmtMonths, fmtTripPct } from '../../engine/format';
import { useOrderClock, usePendingPoints } from '../../hooks';
import { orderStage, STAGES, useEngine, useLab } from '../../store/useLab';

export function StatusChip({ stage }: { stage: number }) {
  const done = stage === STAGES.length - 1;
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${done ? 'bg-brand/10 text-brand' : 'bg-orange/10 text-orange'}`}>
      {STAGES[stage]}
    </span>
  );
}

// The parts of the app, one per TRIP pillar.
const PARTS = [
  { letter: 'T', title: 'Trip goal', sub: 'Your route and three unlocks', to: '/goal' },
  { letter: 'R', title: 'Reward Drops', sub: 'Shop brands that count double', to: '/shop' },
  { letter: 'I', title: 'In it together', sub: 'Your squad and the shared pool', to: '/squad' },
  { letter: 'P', title: 'Proof', sub: 'Watch an order get tracked', to: '/tracking' },
];

export default function Home() {
  const e = useEngine();
  const navigate = useNavigate();
  const activeDrops = useLab((s) => s.activeDrops);
  const orders = useLab((s) => s.trackedOrders);
  const pending = usePendingPoints();
  const now = useOrderClock();
  const stayUnlocked = e.milestones[0].unlocked;
  const tourOpen = useLab((s) => s.tourOpen);
  const setTour = useLab((s) => s.setTour);
  const setMonth = useLab((s) => s.setMonth);
  const jump = Math.ceil(e.milestones[0].monthsAt);

  return (
    <Screen>
      <button
        data-demo="goal-card"
        onClick={() => navigate('/goal')}
        className="relative block w-full overflow-hidden rounded-card p-5 text-left text-white"
        style={{ background: e.dest.gradient }}
      >
        <DestinationArt kind={e.dest.art} />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Your trip goal</p>
          <h1 className="font-display text-[26px] font-extrabold leading-tight">{e.title}</h1>
          <div className="h-12" />
          <p className="mb-2 text-[15px] font-semibold">
            <Num>{fmtINR(e.trip.balance)}</Num> of {fmtINR(e.cost)} · <Num>{fmtTripPct(e.trip.percent)}</Num>
          </p>
          <ProgressBar
            percent={e.trip.percent}
            pending={tripPercent(pending, e.cost)}
            marks={e.milestones.slice(0, -1).map((m) => tripPercent(m.threshold, e.cost))}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">
              {e.next ? (
                <>
                  {e.next.label} in <Num>{fmtMonths(e.next.monthsToGo)}</Num> months
                </>
              ) : (
                'Whole trip funded'
              )}
            </span>
            {pending > 0 && <span className="text-[12px] text-white/80">+{fmtINR(pending)} pending</span>}
          </div>
        </div>
      </button>

      {tourOpen && (
        <section className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[18px] font-bold leading-tight">You're in. Here's what's where.</p>
              <p className="text-[12px] text-muted">Four parts, one trip. Tap any to look around.</p>
            </div>
            <button aria-label="Dismiss guide" onClick={() => setTour(false)} className="rounded-full bg-canvas p-2">
              <X size={14} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PARTS.map((p) => (
              <button key={p.letter} onClick={() => navigate(p.to)} className="flex items-center gap-2.5 rounded-2xl bg-canvas p-2.5 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-display text-[15px] font-extrabold text-white">
                  {p.letter}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight">{p.title}</span>
                  <span className="block text-[11px] leading-tight text-muted">{p.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => setMonth(jump)} className="btn-ghost mt-3 w-full !py-2.5 !text-[13px]">
            <FastForward size={15} /> Fast-forward {jump} months to the first unlock
          </button>
        </section>
      )}

      {stayUnlocked && (
        <button onClick={() => navigate('/unlock')} className="flex w-full items-center justify-between rounded-card bg-unlock p-4 text-left">
          <span className="flex items-center gap-2 font-display text-[16px] font-bold">
            <LockOpen size={18} /> Stay unlocked. Book your hostel
          </span>
          <ChevronRight size={18} />
        </button>
      )}

      <section>
        <p className="label mb-2">Live Drops</p>
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 pt-1">
          {activeDrops.map((id, i) => (
            <DropCard key={id} brand={brandById(id)} rotate={i % 2 ? 3 : -2} />
          ))}
        </div>
      </section>

      <button onClick={() => navigate('/squad')} className="card block w-full p-4 text-left">
        <span className="mb-3 flex items-center justify-between">
          <span className="label">Squad</span>
          <ChevronRight size={16} className="text-muted" />
        </span>
        <SquadStrip />
      </button>

      <section className="card p-4">
        <button onClick={() => navigate('/tracking')} className="mb-1 flex w-full items-center justify-between">
          <span className="label">Recent activity</span>
          <ChevronRight size={16} className="text-muted" />
        </button>
        <ul className="divide-y divide-ink/[0.06]">
          {orders.slice(0, 3).map((o) => {
            const b = brands.find((x) => x.id === o.brandId)!;
            return (
              <li key={o.id} className="flex items-center justify-between gap-2 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">
                    {b.name} · {fmtINR(o.amount)}
                  </span>
                  <span className="block text-[12px] text-orange">+{fmtINR(e.earnFor(o.brandId, o.amount, o.inDrop))} toward {e.dest.name}</span>
                </span>
                <StatusChip stage={orderStage(o, now)} />
              </li>
            );
          })}
        </ul>
      </section>

      <button onClick={() => navigate('/wrapped')} className="flex w-full items-center justify-between rounded-card bg-ink p-4 text-left text-white">
        <span className="flex items-center gap-2 text-[14px] font-semibold">
          <Sparkles size={16} className="text-pink" /> Your {new Date().getFullYear()} on Onpoint, so far
        </span>
        <ChevronRight size={16} />
      </button>
    </Screen>
  );
}
