import { useState } from 'react';
import { Num, Screen } from '../../components/ui';
import { bluChips, rupeeValue } from '../../engine/calc';
import { fmtInt } from '../../engine/format';
import { useEngine } from '../../store/useLab';

/** Conversion partners with ratios and inputs. Riya still cannot tell when she will travel. */
export default function TodayRedeem() {
  const e = useEngine();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const bal = e.today.balance;

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
                className="w-0 flex-1 rounded-xl border border-ink/[0.12] bg-canvas px-3 py-2.5 text-[14px] outline-none focus:border-muted"
              />
              <span className="w-[120px] text-right text-[12px] text-muted">{n > 0 ? p.out(n) : '—'}</span>
            </div>
            <button disabled className="mt-3 w-full rounded-full border border-ink/[0.12] py-2.5 text-[13px] font-semibold text-muted">
              Transfer
            </button>
          </section>
        );
      })}

      {/* Opens nothing, on purpose: the current product cannot answer this. */}
      <button data-demo="flight-link" className="block w-full py-2 text-center text-[13px] text-muted underline">
        How many points do I need for a flight?
      </button>
    </Screen>
  );
}
