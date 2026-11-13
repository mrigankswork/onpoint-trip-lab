import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { Num, Screen } from '../../components/ui';
import { bluChips, rupeeValue } from '../../engine/calc';
import { fmtINR, fmtInt, fmtMonths } from '../../engine/format';
import { useFlip } from '../../hooks';
import { useEngine, useLab } from '../../store/useLab';

/** Conversion partners with ratios and inputs. Riya still cannot tell when she will travel. */
export default function TodayRedeem() {
  const e = useEngine();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const bal = e.today.balance;
  const showToast = useLab((s) => s.showToast);
  const demoStep = useLab((s) => s.demoStep);
  const flip = useFlip();
  const [flightOpen, setFlightOpen] = useState(false);

  // A new demo step always starts with the sheet closed.
  useEffect(() => setFlightOpen(false), [demoStep]);

  // Simulated: the button answers, but no points move.
  const transfer = (name: string, n: number, out: string) => {
    if (n <= 0) showToast('Enter how many Onpoints to transfer');
    else if (n > bal) showToast(`You have ${fmtInt(bal)} Onpoints. That is not enough yet.`);
    else showToast(`Simulated: ${fmtInt(n)} Onpoints to ${name} = ${out}`);
  };

  const partners = [
    {
      id: 'indigo',
      name: 'IndiGo BluChip',
      ratio: `5 Onpoints : ${fmtInt(bluChips(e.v, 5))} BluChips`,
      out: (n: number) => `${fmtInt(bluChips(e.v, n))} BluChips`,
    },
    {
      id: 'airindia',
      name: 'Air India Maharaja Club',
      ratio: 'Ratio as per partner terms',
      out: () => 'See partner terms',
    },
    {
      id: 'vouchers',
      name: 'Gift vouchers',
      ratio: `1 Onpoint : ₹${fmtInt(rupeeValue(e.v, 1))}`,
      out: (n: number) => `₹${fmtInt(rupeeValue(e.v, n))} voucher`,
    },
  ];

  return (
    <Screen>
      <div>
        <h1 className="text-xl font-semibold">Transfer Onpoints</h1>
        <p className="text-[13px] text-muted">
          Onpoints balance: <Num>{fmtInt(bal)}</Num>
        </p>
      </div>

      <p className="label pt-1">Conversion partners</p>
      {partners.map((p) => {
        const n = Number(amounts[p.id] ?? '') || 0;
        return (
          <section key={p.id} className="card p-4">
            <p className="text-[15px] font-semibold">{p.name}</p>
            <p className="text-[12px] text-muted">{p.ratio}</p>
            <div className="mt-3 flex items-center gap-2">
              <input
                inputMode="numeric"
                placeholder="Onpoints"
                aria-label={`Onpoints to transfer to ${p.name}`}
                value={amounts[p.id] ?? ''}
                onChange={(ev) => setAmounts({ ...amounts, [p.id]: ev.target.value.replace(/\D/g, '') })}
                className="w-0 flex-1 rounded-xl border border-fg/[0.12] bg-canvas px-3 py-2.5 text-[14px] outline-none focus:border-muted"
              />
              <span className="w-[120px] text-right text-[12px] text-muted">{n > 0 ? p.out(n) : '—'}</span>
            </div>
            <button
              onClick={() => transfer(p.name, n, p.out(n))}
              className={`mt-3 w-full rounded-full border border-fg/[0.12] py-2.5 text-[13px] font-semibold ${n > 0 ? 'text-fg' : 'text-muted'}`}
            >
              Transfer
            </button>
          </section>
        );
      })}

      <button
        data-demo="flight-link"
        onClick={() => setFlightOpen(true)}
        className="block w-full py-2 text-center text-[13px] text-muted underline"
      >
        How many points do I need for a flight?
      </button>

      {/* The honest answer: today's app shows a ratio, not a trip. */}
      <Sheet open={flightOpen} onClose={() => setFlightOpen(false)} title="How many points for a flight?">
        <p className="text-[13px] text-muted">
          The app today shows a conversion ratio. It does not show what a trip costs in points, or when you will get there.
        </p>
        <dl className="mt-4 space-y-2 rounded-[14px] bg-canvas p-3 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-muted">Your balance</dt>
            <dd className="font-semibold">
              {fmtInt(bal)} Onpoints = {fmtInt(bluChips(e.v, bal))} BluChips
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">You earn</dt>
            <dd className="font-semibold">{fmtInt(e.today.monthly)} Onpoints a month</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">
              {e.dest.name} trip ({fmtINR(e.cost)})
            </dt>
            <dd className="font-semibold">{fmtMonths(e.today.monthsTrip)} months away</dd>
          </div>
        </dl>
        <button
          onClick={() => {
            setFlightOpen(false);
            flip('trip');
          }}
          className="btn mt-4 w-full"
        >
          See the answer With TRIP <ArrowRight size={16} />
        </button>
      </Sheet>
    </Screen>
  );
}
