import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { TrackingTimeline } from '../../components/TrackingTimeline';
import { Screen } from '../../components/ui';
import { brandById } from '../../data/brands';
import { rupeeValue } from '../../engine/calc';
import { fmtINR, fmtInt } from '../../engine/format';
import { useOrderClock } from '../../hooks';
import { orderStage, useEngine, useLab } from '../../store/useLab';
import { StatusChip } from './Home';

export default function Tracking() {
  const e = useEngine();
  const orders = useLab((s) => s.trackedOrders);
  const now = useOrderClock();
  const [latest, ...rest] = orders;
  const brand = brandById(latest.brandId);
  const earn = e.earnFor(latest.brandId, latest.amount, latest.inDrop);

  return (
    <Screen>
      <h1 className="font-display text-[22px] font-extrabold">Tracked live</h1>

      <section className="card p-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-display text-[18px] font-bold">
              {brand.name} · {fmtINR(latest.amount)}
            </p>
            <p className="text-[13px] font-semibold text-orange">
              +{fmtINR(earn)} toward {e.dest.name}
            </p>
          </div>
          <StatusChip stage={orderStage(latest, now)} />
        </div>
        <TrackingTimeline order={latest} now={now} />
        <p className="mt-4 text-[11px] text-muted">Times are illustrative.</p>
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-card bg-brand p-3.5 text-white">
          <BadgeCheck size={20} />
          <p className="mt-2 font-display text-[15px] font-bold leading-tight">
            {fmtInt(1)} Onpoint = ₹{fmtInt(rupeeValue(e.v, 1))}, always
          </p>
        </div>
        <div className="rounded-card bg-ink p-3.5 text-white">
          <ShieldCheck size={20} />
          <p className="mt-2 font-display text-[15px] font-bold leading-tight">Tracked or we pay</p>
        </div>
      </div>

      {rest.length > 0 && (
        <section className="card p-4">
          <p className="label mb-1">Earlier orders</p>
          <ul className="divide-y divide-ink/[0.06]">
            {rest.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 py-2.5">
                <span>
                  <span className="block text-[14px] font-semibold">
                    {brandById(o.brandId).name} · {fmtINR(o.amount)}
                  </span>
                  <span className="block text-[12px] text-orange">+{fmtINR(e.earnFor(o.brandId, o.amount, o.inDrop))}</span>
                </span>
                <StatusChip stage={orderStage(o, now)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Screen>
  );
}
