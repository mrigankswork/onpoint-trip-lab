import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ProgressBar';
import { Num, Screen, Sticker } from '../../components/ui';
import { brands } from '../../data/brands';
import { tripPercent } from '../../engine/calc';
import { fmtCountdown, fmtINR, fmtTripPct } from '../../engine/format';
import { useNow, usePendingPoints } from '../../hooks';
import { useEngine, useLab } from '../../store/useLab';

export default function Shop() {
  const e = useEngine();
  const navigate = useNavigate();
  const activeDrops = useLab((s) => s.activeDrops);
  const openCheckout = useLab((s) => s.openCheckout);
  const latest = useLab((s) => s.trackedOrders[0]);
  const pending = usePendingPoints();
  const now = useNow(30_000);

  const sorted = [...brands].sort(
    (a, b) => Number(activeDrops.includes(b.id)) - Number(activeDrops.includes(a.id)),
  );

  return (
    <Screen>
      <section className="rounded-card bg-ink p-4 text-white">
        <div className="mb-2 flex items-baseline justify-between text-[13px] font-semibold">
          <span>{e.title}</span>
          <span>
            <Num>{fmtINR(e.trip.balance)}</Num> · <Num>{fmtTripPct(e.trip.percent)}</Num>
          </span>
        </div>
        <ProgressBar percent={e.trip.percent} pending={tripPercent(pending, e.cost)} height={10} />
        {pending > 0 && (
          <button onClick={() => navigate('/tracking')} className="mt-2 flex w-full items-center justify-between text-[12px] text-white/80">
            <span>+{fmtINR(pending)} pending from your last order</span>
            <span className="flex items-center font-semibold text-white">
              Track it <ChevronRight size={14} />
            </span>
          </button>
        )}
      </section>

      <h1 className="font-display text-[22px] font-extrabold">Shop toward {e.dest.name}</h1>

      <div className="grid grid-cols-2 gap-2.5">
        {sorted.map((b, i) => {
          const inDrop = activeDrops.includes(b.id);
          const amount = b.spend || 1000;
          const earn = e.earnFor(b.id, amount, inDrop);
          if (b.redemptionPartner) {
            return (
              <button key={b.id} onClick={() => navigate('/unlock')} className="card p-3.5 text-left">
                <p className="font-display text-[17px] font-bold">{b.name}</p>
                <p className="text-[12px] text-muted">{b.category}</p>
                <p className="mt-3 text-[13px] font-semibold text-brand">Use your Stay unlock here</p>
              </button>
            );
          }
          return (
            <button
              key={b.id}
              data-demo={`brand-${b.id}`}
              data-fly-src={b.id}
              onClick={() => openCheckout(b.id)}
              className="card relative p-3.5 text-left"
            >
              {inDrop && (
                <Sticker className="absolute -top-2 right-2 bg-orange text-white" rotate={i % 2 ? 3 : -2}>
                  {e.v.dropsMultiplier}x
                </Sticker>
              )}
              <p className="font-display text-[17px] font-bold">{b.name}</p>
              <p className="text-[12px] text-muted">{b.category}</p>
              <p className="mt-3 text-[13px] font-semibold text-orange">
                +{fmtINR(earn)} toward {e.dest.name}
              </p>
              <p className="text-[12px] text-muted">
                on {fmtINR(amount)}
                {inDrop && b.dropEndsAt ? ` · ${fmtCountdown(b.dropEndsAt - now)} left` : ''}
              </p>
            </button>
          );
        })}
      </div>
      {latest && latest.createdAt > 0 && pending === 0 && (
        <button onClick={() => navigate('/tracking')} className="btn-ghost w-full">
          See your tracked orders
        </button>
      )}
    </Screen>
  );
}
