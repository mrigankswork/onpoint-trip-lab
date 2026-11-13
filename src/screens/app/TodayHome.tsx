import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Num, Screen } from '../../components/ui';
import { brands } from '../../data/brands';
import { ASSUMPTIONS } from '../../engine/assumptions';
import { fmtInt, fmtPct } from '../../engine/format';
import { useEngine } from '../../store/useLab';

/** A plain take on the current product. Deliberately flat: no goal, no destination, no friends. */
export default function TodayHome() {
  const e = useEngine();
  const navigate = useNavigate();
  const { search } = useLocation();
  const brandsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.includes('brands')) brandsRef.current?.scrollIntoView({ block: 'start' });
  }, [search]);

  return (
    <Screen>
      <section className="card p-5">
        <p className="label">Onpoints balance</p>
        <p className="mt-1 font-display text-5xl font-bold text-muted">
          <Num>{fmtInt(e.today.balance)}</Num>
        </p>
        <p className="mt-1 text-[13px] text-muted">Onpoints · {fmtInt(e.today.monthly)} earned per month</p>
        <div className="mt-4 border-t border-fg/[0.08] pt-3 text-[13px] text-muted">
          Pending: {fmtInt(e.today.pending)} Onpoints
        </div>
      </section>

      <button onClick={() => navigate('/today/redeem')} className="btn-ghost w-full !text-muted">
        Transfer Onpoints
      </button>

      <div ref={brandsRef} className="pt-1">
        <p className="label mb-2">Brands · {ASSUMPTIONS.brandCount.display} partners</p>
        <div className="grid grid-cols-2 gap-2.5">
          {brands.map((b) => (
            <div key={b.id} className="card p-3.5">
              <p className="text-[15px] font-semibold">{b.name}</p>
              <p className="text-[12px] text-muted">{b.category}</p>
              <p className="mt-3 text-[12px] font-medium text-muted">Earn {fmtPct(b.baseEarn)} Onpoints</p>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
