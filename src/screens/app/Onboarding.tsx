import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DestinationArt } from '../../components/DestinationArt';
import { Avatar, Screen, Sticker } from '../../components/ui';
import { destinations, PIECE_LABEL } from '../../data/destinations';
import { defaultSquad } from '../../data/squad';
import { monthsTo, PIECE_ORDER, tripCost } from '../../engine/calc';
import { fmtINR, fmtInt, fmtMonths } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';

export default function Onboarding() {
  const e = useEngine();
  const navigate = useNavigate();
  const step = useLab((s) => s.onboardingStep);
  const setStep = useLab((s) => s.setOnboardingStep);
  const destinationId = useLab((s) => s.destinationId);
  const setDestination = useLab((s) => s.setDestination);
  const tripType = useLab((s) => s.tripType);
  const setTripType = useLab((s) => s.setTripType);
  const finish = useLab((s) => s.finishOnboarding);
  const showToast = useLab((s) => s.showToast);
  const [landing, setLanding] = useState(false);

  const firstUnlock = monthsTo(e.v, 'trip', e.dest.pieces.stay);

  const start = () => {
    if (landing) return;
    setLanding(true);
    setTimeout(() => {
      finish();
      showToast(`Welcome bonus landed: +${fmtInt(e.v.welcomeBonus)} Onpoints`);
      navigate('/home');
    }, 1300);
  };

  return (
    <Screen>
      <div className="flex items-center gap-3">
        <button
          aria-label="Back"
          onClick={() => setStep(Math.max(0, step - 1))}
          className={`rounded-full bg-white p-2 ${step === 0 ? 'invisible' : ''}`}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand' : 'bg-ink/10'}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <>
          <h1 className="font-display text-[28px] font-extrabold leading-tight">Where's your next weekend?</h1>
          <div className="grid grid-cols-2 gap-2.5">
            {destinations.map((d, i) => {
              const on = d.id === destinationId;
              return (
                <button
                  key={d.id}
                  data-demo={`dest-${d.id}`}
                  onClick={() => setDestination(d.id)}
                  aria-pressed={on}
                  className={`relative h-[128px] overflow-hidden rounded-card p-3 text-left text-white ${i === 0 ? 'col-span-2' : ''}`}
                  style={{ background: d.gradient, boxShadow: on ? '0 0 0 3px var(--canvas), 0 0 0 6px var(--brand)' : undefined }}
                >
                  <DestinationArt kind={d.art} />
                  <span className="relative block font-display text-xl font-bold">{d.name}</span>
                  <span className="relative block text-[12px] text-white/80">{d.vibe}</span>
                  <span className="absolute bottom-3 left-3 text-[12px] font-semibold">
                    {fmtINR(tripCost(d.pieces))} per person
                  </span>
                  {on && (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button data-demo="onb-next" onClick={() => setStep(1)} className="btn w-full">
            {e.dest.name} it is
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="font-display text-[28px] font-extrabold leading-tight">Who's coming?</h1>
          {(
            [
              { id: 'solo', label: 'Solo', sub: 'Just me and a backpack', icon: User },
              { id: 'squad', label: 'Squad', sub: 'Four of us, one goal', icon: Users },
            ] as const
          ).map((o) => {
            const on = tripType === o.id;
            return (
              <button
                key={o.id}
                data-demo={`onb-${o.id}`}
                onClick={() => setTripType(o.id)}
                aria-pressed={on}
                className={`card w-full p-4 text-left ${on ? '!border-brand ring-2 ring-brand' : ''}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${on ? 'bg-brand text-white' : 'bg-canvas'}`}>
                    <o.icon size={18} />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold">{o.label}</span>
                    <span className="block text-[12px] text-muted">{o.sub}</span>
                  </span>
                </span>
                {o.id === 'squad' && on && (
                  <span className="mt-3 flex items-center gap-2">
                    {defaultSquad(false).map((m) => (
                      <Avatar key={m.id} initials={m.isYou ? m.initials : '+'} colour={m.isYou ? m.colour : 'rgb(var(--ink-rgb) / 0.15)'} size={36} />
                    ))}
                    <span className="text-[12px] text-muted">3 slots to fill</span>
                  </span>
                )}
              </button>
            );
          })}
          <button data-demo="onb-next" onClick={() => setStep(2)} className="btn w-full">
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="font-display text-[28px] font-extrabold leading-tight">Here's your plan.</h1>
          <section className="relative overflow-hidden rounded-card p-4 text-white" style={{ background: e.dest.gradient }}>
            <DestinationArt kind={e.dest.art} />
            <p className="relative font-display text-xl font-bold">{e.title}</p>
            <p className="relative text-[13px] text-white/80">
              {fmtINR(e.cost)} per person, in three unlocks
            </p>
            <div className="h-10" />
          </section>
          <div className="card divide-y divide-ink/[0.06]">
            {PIECE_ORDER.map((k, i) => (
              <div key={k} className="flex items-center justify-between p-3.5">
                <span>
                  <span className="block text-[14px] font-semibold">
                    {i + 1}. {PIECE_LABEL[k]}
                  </span>
                  <span className="block text-[12px] text-muted">{e.dest.pieceNotes[k]}</span>
                </span>
                <span className="font-display text-lg font-bold">{fmtINR(e.dest.pieces[k])}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Sticker className="bg-unlock text-ink" rotate={-2}>
              First unlock in ~{fmtMonths(firstUnlock)} months
            </Sticker>
            <AnimatePresence>
              {landing && (
                <motion.span
                  className="rounded-full bg-orange px-3 py-1.5 text-[13px] font-bold text-white"
                  initial={{ opacity: 0, y: 24, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  +{fmtInt(e.v.welcomeBonus)} welcome bonus
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button data-demo="onb-start" onClick={start} className="btn w-full">
            Start my trip
          </button>
        </>
      )}
    </Screen>
  );
}
