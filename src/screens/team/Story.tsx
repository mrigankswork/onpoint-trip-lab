import { ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MonthSlider } from '../../components/MonthSlider';
import { Num } from '../../components/ui';
import { fmtINR, fmtInt, fmtMonths, fmtPct, fmtTripPct } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';

interface Note {
  pillar: string;
  title: string;
  proves: string;
  criterion?: string;
}

const NOTES: Record<string, Note> = {
  '/today': {
    pillar: 'Today',
    title: 'A balance, not a trip',
    proves:
      'Riya is earning, but all she sees is a number and a pending line with no date. Nothing tells her what the points are for or when they turn into travel.',
  },
  '/today/redeem': {
    pillar: 'Today',
    title: 'Ratios, not answers',
    proves:
      'Conversion partners and ratios assume Riya already knows what she wants. "How many points do I need for a flight?" has no answer here.',
  },
  '/onboarding': {
    pillar: 'T · Trip Goals',
    title: 'Pick the trip, not the programme',
    proves: 'A few taps turn points into a destination, a price in rupees and a date for the first unlock.',
    criterion: 'Clarity',
  },
  '/home': {
    pillar: 'T · R · I · P',
    title: 'One screen, four pillars',
    proves:
      'The goal bar speaks rupees and trip %. Drops give a reason to open the app this week. The squad makes it social. Tracked orders show the points are real.',
    criterion: 'Clarity',
  },
  '/goal': {
    pillar: 'T · Trip Goals',
    title: 'Milestones beat a far-off total',
    proves:
      'The trip unlocks in three pieces, so the first win (the Stay) is months away, not a year and a half. Each piece shows its own months to go.',
    criterion: 'Clarity',
  },
  '/shop': {
    pillar: 'R · Reward Drops',
    title: 'Every tile speaks rupees toward the goal',
    proves:
      'A 2x Drop on brands Riya already uses makes routing spend through Onpoint feel urgent. Brands fund the boost.',
    criterion: 'Desirability',
  },
  '/tracking': {
    pillar: 'P · Proof and trust',
    title: 'Tracked live, with a guarantee',
    proves:
      'Every order shows where it is: clicked, placed, tracked, confirmed. "1 Onpoint = ₹1, always" and "Tracked or we pay" answer the two fears: will it track, and what is it worth.',
    criterion: 'Credibility',
  },
  '/squad': {
    pillar: 'I · In it together',
    title: 'Trips are group trips. So is the goal.',
    proves:
      'A shared goal and invites bring in friends. Honest note: pooling does not make points faster per person. It adds accountability and referrals, which is why the group estimate equals the solo one.',
    criterion: 'Distinctiveness',
  },
  '/unlock': {
    pillar: 'T · Trip Goals',
    title: 'The first unlock is the hook',
    proves: 'Reaching the Stay is a moment: the piece flips, and Riya can book. That is the proof the system pays out.',
    criterion: 'Clarity',
  },
  '/wrapped': {
    pillar: 'I · In it together',
    title: 'Worth posting about',
    proves: 'A story-sized card turns progress into reach. Each share is an invite Onpoint did not pay for.',
    criterion: 'Distinctiveness',
  },
  '/profile': {
    pillar: 'About',
    title: 'Same Riya, two products',
    proves: 'The switch at the top of the app keeps the persona, the spend and the month fixed. Only the product changes.',
  },
};

// The parts of the app, in the order a judge should see them.
const PARTS = ['/today', '/onboarding', '/goal', '/shop', '/tracking', '/squad', '/unlock', '/wrapped'];

function NoteCard({ note, label }: { note: Note; label?: string }) {
  return (
    <section className="card p-5">
      {label && <p className="label mb-2">{label}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-white">{note.pillar}</span>
        {note.criterion && (
          <span className="rounded-full bg-peach px-3 py-1 text-[12px] font-semibold">Proves: {note.criterion}</span>
        )}
      </div>
      <h2 className="mt-3 font-display text-[26px] font-extrabold leading-tight">{note.title}</h2>
      <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed">{note.proves}</p>
    </section>
  );
}

export default function Story({ besidePhone = false }: { besidePhone?: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const e = useEngine();
  const mode = useLab((s) => s.mode);
  const setView = useLab((s) => s.setView);
  const note = NOTES[pathname] ?? NOTES['/profile'];

  const open = (path: string) => {
    setView('app');
    navigate(path);
  };

  const rows = [
    { label: 'Spend routed through Onpoint', today: `${fmtINR(e.today.spend)}/mo`, trip: `${fmtINR(e.trip.spend)}/mo` },
    { label: 'Effective earn rate', today: fmtPct(e.today.rate, 1), trip: fmtPct(e.trip.rate, 1) },
    { label: 'Onpoints earned per month', today: fmtInt(e.today.monthly), trip: fmtInt(e.trip.monthly) },
    { label: `Balance at month ${fmtMonths(e.month)}`, today: fmtINR(e.today.balance), trip: fmtINR(e.trip.balance) },
    { label: `Progress to ${e.dest.name}`, today: 'no goal shown', trip: fmtTripPct(e.trip.percent) },
    { label: 'Months to first unlock (Stay)', today: 'no goal shown', trip: fmtMonths(e.trip.monthsStay) },
    { label: 'Months to the whole trip', today: fmtMonths(e.today.monthsTrip), trip: fmtMonths(e.trip.monthsTrip) },
  ];

  return (
    <div className="space-y-4">
      {besidePhone ? (
        <NoteCard note={note} />
      ) : (
        <section className="rounded-card bg-ink p-6 text-white">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-white/60">Onpoint Trip Lab</p>
          <h1 className="mt-2 max-w-[24ch] font-display text-[30px] font-extrabold leading-[1.05] md:text-[38px]">
            Same Riya. Same spend. From {fmtMonths(e.today.monthsTrip)} months to a first unlock in {fmtMonths(e.trip.monthsStay)}.
          </h1>
          <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-white/80">
            The app shows what Riya sees. The Lab shows why it works: what each screen proves, and every number behind it,
            traceable to an assumption you can change.
          </p>
          <button onClick={() => setView('app')} className="btn mt-4 !bg-unlock !text-ink">
            Open the app <ArrowRight size={16} />
          </button>
        </section>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section className="card p-5">
          <MonthSlider />
          <p className="mt-3 text-[12px] text-muted">
            Moves time in the app too. Balances, progress and unlocks all follow.
          </p>
        </section>
        <section className="card overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-ink/[0.08] text-[11px] uppercase tracking-wider text-muted">
                <th className="p-3 font-semibold">Same Riya</th>
                <th className={`p-3 text-right font-semibold ${mode === 'today' ? 'text-ink' : ''}`}>Today</th>
                <th className={`p-3 text-right font-semibold ${mode === 'trip' ? 'text-brand' : ''}`}>With TRIP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-ink/[0.05] last:border-0">
                  <td className="p-3">{r.label}</td>
                  <td className="p-3 text-right text-muted">
                    <Num>{r.today}</Num>
                  </td>
                  <td className="p-3 text-right font-semibold text-brand">
                    <Num>{r.trip}</Num>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {!besidePhone && (
        <section>
          <p className="label mb-2">What each part of the app proves</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PARTS.map((path) => {
              const n = NOTES[path];
              return (
                <button key={path} onClick={() => open(path)} className="card flex flex-col p-4 text-left">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">{n.pillar}</span>
                    {n.criterion && <span className="rounded-full bg-peach px-2.5 py-0.5 text-[11px] font-semibold">{n.criterion}</span>}
                  </span>
                  <span className="mt-2.5 font-display text-[17px] font-bold leading-tight">{n.title}</span>
                  <span className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-muted">{n.proves}</span>
                  <span className="mt-3 flex items-center gap-1 text-[12.5px] font-semibold text-brand">
                    See it in the app <ArrowRight size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <p className="text-[12px] text-muted">
        Every figure comes from one calculation engine. Open Calculator, Growth or Assumptions to trace and change it.
      </p>
    </div>
  );
}
