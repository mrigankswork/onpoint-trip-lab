import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, LockOpen, MapPin, User, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DestinationArt } from '../../components/DestinationArt';
import { Disclaimer } from '../../components/Disclaimer';
import { Avatar, Sticker, WingMark } from '../../components/ui';
import { destinations, PIECE_LABEL } from '../../data/destinations';
import { persona } from '../../data/persona';
import { defaultSquad } from '../../data/squad';
import { monthsTo, PIECE_ORDER, tripCost } from '../../engine/calc';
import { fmtINR, fmtInt, fmtMonths } from '../../engine/format';
import { useFlip } from '../../hooks';
import { useEngine, useLab } from '../../store/useLab';

const LAST = 3;

export default function Onboarding() {
  const e = useEngine();
  const navigate = useNavigate();
  const flip = useFlip();
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

  const cta = [
    'Plan my first trip',
    `${e.dest.name} it is`,
    tripType === 'squad' ? 'Bring the gang' : 'Just me',
    'Start my trip',
  ][step];

  const how = [
    { icon: MapPin, title: 'Pick a trip', sub: 'A real place with a real price, in rupees.' },
    { icon: Zap, title: 'Catch Drops', sub: `${e.v.dropsMultiplier}x on brands you already use, for a limited time.` },
    { icon: LockOpen, title: 'Unlock it piece by piece', sub: 'The stay first, then travel, then the experience.' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 px-4 pt-3">
        <button
          aria-label="Back"
          onClick={() => setStep(Math.max(0, step - 1))}
          className={`rounded-full bg-white p-2 ${step === 0 ? 'invisible' : ''}`}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={LAST + 1} aria-valuenow={step + 1}>
          {Array.from({ length: LAST + 1 }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${i <= step ? 'bg-brand' : 'bg-ink/10'}`} />
          ))}
        </div>
        <span className="w-8 text-right text-[12px] font-semibold text-muted">
          {step + 1}/{LAST + 1}
        </span>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="space-y-3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {step === 0 && (
              <>
                <section
                  className="relative overflow-hidden rounded-card p-5 text-white"
                  style={{ background: 'linear-gradient(165deg, var(--brand) 0%, var(--ink) 100%)' }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-[38%]">
                    <DestinationArt kind="mountain" />
                  </div>
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand">
                    <WingMark size={22} />
                  </span>
                  <h1 className="relative mt-4 font-display text-[30px] font-extrabold leading-[1.05]">
                    Your spends already earn. Point them at a trip.
                  </h1>
                  <p className="relative mt-2 text-[13px] text-white/80">
                    You're exploring as {persona.name}, {persona.age}, first job in {persona.city}.
                  </p>
                  <div className="h-20" />
                </section>
                <ul className="card divide-y divide-ink/[0.06]">
                  {how.map((h, i) => (
                    <li key={h.title} className="flex items-center gap-3 p-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <h.icon size={18} />
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold">
                          {i + 1}. {h.title}
                        </span>
                        <span className="block text-[12px] text-muted">{h.sub}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {step === 1 && (
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
                        className={`relative h-[120px] overflow-hidden rounded-card p-3 text-left text-white ${i === 0 ? 'col-span-2' : ''}`}
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
              </>
            )}

            {step === 2 && (
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
                          {defaultSquad(true).map((m) => (
                            <Avatar key={m.id} initials={m.initials} colour={m.colour} size={36} dim={!m.isYou} />
                          ))}
                          <span className="text-[12px] text-muted">
                            +{fmtInt(e.v.referralBonus)} Onpoints for each friend who joins
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
                <p className="rounded-card bg-peach p-3.5 text-[12.5px] font-medium">
                  A squad doesn't make points faster. It makes the trip actually happen.
                </p>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="font-display text-[28px] font-extrabold leading-tight">Here's your plan.</h1>
                <section className="relative overflow-hidden rounded-card p-4 text-white" style={{ background: e.dest.gradient }}>
                  <DestinationArt kind={e.dest.art} />
                  <p className="relative font-display text-xl font-bold">{e.title}</p>
                  <p className="relative text-[13px] text-white/80">{fmtINR(e.cost)} per person, in three unlocks</p>
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
                <div className="flex min-h-[34px] items-center justify-between">
                  <Sticker className="bg-unlock text-ink" rotate={-2}>
                    First unlock in ~{fmtMonths(firstUnlock)} months
                  </Sticker>
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
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="shrink-0 border-t border-ink/[0.06] bg-canvas px-4 pt-3"
        style={{ paddingBottom: 'max(8px, var(--safe-bottom, env(safe-area-inset-bottom, 0px)))' }}
      >
        <button
          data-demo={step === LAST ? 'onb-start' : 'onb-next'}
          onClick={() => (step === LAST ? start() : setStep(step + 1))}
          className="btn w-full !py-3.5 !text-[15px]"
        >
          {cta} <ArrowRight size={16} />
        </button>
        {step === 0 && (
          <button onClick={() => flip('today')} className="mt-1 w-full py-2 text-[13px] font-semibold text-muted">
            See the app as it is today first
          </button>
        )}
        <Disclaimer className="!px-0 !pb-1 !pt-2" />
      </div>
    </div>
  );
}
