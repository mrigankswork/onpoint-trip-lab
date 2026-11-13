import { motion } from 'framer-motion';
import { BedDouble, Lock, LockOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Confetti } from '../../components/Effects';
import { ProgressBar } from '../../components/ProgressBar';
import { Num, Screen, Sticker } from '../../components/ui';
import { tripPercent } from '../../engine/calc';
import { fmtINR, fmtMonths } from '../../engine/format';
import { useEngine } from '../../store/useLab';

export default function Unlock() {
  const e = useEngine();
  const stay = e.milestones[0];
  const [fire, setFire] = useState(0);
  const [booked, setBooked] = useState(false);
  const was = useRef<boolean | null>(null);

  // Celebrate when the Stay flips to unlocked (or on arrival, if it already has).
  useEffect(() => {
    if (stay.unlocked && was.current !== true) setFire((n) => n + 1);
    if (!stay.unlocked) setBooked(false);
    was.current = stay.unlocked;
  }, [stay.unlocked]);

  const stayPct = tripPercent(e.trip.balance, stay.threshold);

  return (
    <Screen>
      <div className="relative">
        <Confetti fire={fire} />
        <motion.section
          key={String(stay.unlocked)}
          className={`rounded-card border p-5 ${stay.unlocked ? 'border-ink bg-unlock text-ink' : 'border-fg/[0.08] bg-surface'}`}
          initial={{ rotateX: 70, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="flex items-start justify-between">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${stay.unlocked ? 'bg-ink text-unlock' : 'bg-canvas text-muted'}`}>
              {stay.unlocked ? <LockOpen size={22} /> : <Lock size={22} />}
            </span>
            {stay.unlocked && (
              <Sticker className="bg-ink text-unlock" rotate={3}>
                Unlocked
              </Sticker>
            )}
          </div>
          <h1 className="mt-4 font-display text-[28px] font-extrabold leading-tight">
            {stay.unlocked ? `Your ${e.dest.name} stay is unlocked` : `Stay in ${e.dest.name}`}
          </h1>
          <p className={`mt-1 text-[14px] ${stay.unlocked ? 'text-ink/75' : 'text-muted'}`}>
            {stay.note} · {fmtINR(stay.cost)}
          </p>
          {!stay.unlocked && (
            <div className="mt-5">
              <ProgressBar percent={stayPct} tone="light" />
              <p className="mt-2 text-[13px] font-semibold">
                <Num>{fmtINR(e.trip.balance)}</Num> of {fmtINR(stay.threshold)} · <Num>{fmtMonths(stay.monthsToGo)}</Num> months to go
              </p>
            </div>
          )}
          {stay.unlocked && !booked && (
            <button data-demo="book-hostel" onClick={() => setBooked(true)} className="btn mt-5 w-full !bg-ink">
              <BedDouble size={16} /> Book your hostel
            </button>
          )}
        </motion.section>
      </div>

      {stay.unlocked && booked && (
        <motion.section
          className="overflow-hidden rounded-card border border-dashed border-fg/30 bg-surface"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bg-brand p-4 text-white">
            <p className="label !text-white/70">Stay voucher</p>
            <p className="font-display text-[32px] font-extrabold">{fmtINR(stay.cost)}</p>
            <p className="text-[13px] text-white/80">{stay.note}</p>
          </div>
          <div className="p-4">
            <p className="text-[14px] font-semibold">{e.dest.stayPartner}</p>
            <p className="text-[12px] text-muted">Illustrative partner. Voucher shown for the concept only.</p>
          </div>
        </motion.section>
      )}

      <p className="text-center text-[12px] text-muted">
        Next up: {e.milestones[1].label} ({fmtINR(e.milestones[1].cost)}), then {e.milestones[2].label} ({fmtINR(e.milestones[2].cost)}).
      </p>
    </Screen>
  );
}
