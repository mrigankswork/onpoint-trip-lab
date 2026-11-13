import { ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Screen } from '../../components/ui';
import { DISCLAIMER, persona } from '../../data/persona';
import { fmtINR } from '../../engine/format';
import { useMedia } from '../../hooks';
import { LAYOUT_PARAM, useEngine, useLab } from '../../store/useLab';

export default function Profile() {
  const e = useEngine();
  const navigate = useNavigate();
  const resetStory = useLab((s) => s.resetStory);
  const setMonth = useLab((s) => s.setMonth);
  const setPanelTab = useLab((s) => s.setPanelTab);
  const wide = useMedia('(min-width: 900px)');
  const hasPanel = LAYOUT_PARAM ? LAYOUT_PARAM === 'landscape' : wide;

  const replay = () => {
    resetStory({ fresh: true });
    setMonth(0);
    navigate('/onboarding');
  };

  return (
    <Screen>
      <section className="card flex items-center gap-4 p-4">
        <Avatar initials={persona.initials} colour="var(--brand)" size={56} />
        <div>
          <h1 className="font-display text-[22px] font-extrabold leading-tight">{persona.fullName}</h1>
          <p className="text-[13px] text-muted">
            {persona.age} · {persona.city} · {persona.job}
          </p>
          <p className="text-[13px] text-muted">Spends {fmtINR(e.today.spend)} a month online</p>
        </div>
      </section>

      <section className="card p-4">
        <p className="label">Two modes, one Riya</p>
        <p className="mt-2 text-[13px] leading-relaxed">
          <strong>Today</strong> is a plain take on the current Onpoint app: a balance and a list of conversion partners.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed">
          <strong>With TRIP</strong> is our redesign: Trip Goals, Reward Drops, In it together, Proof and trust. Same person, same
          spend, same month. Flip the switch at the top to compare.
        </p>
      </section>

      <button
        data-demo="team-link"
        onClick={() => (hasPanel ? setPanelTab('calculator') : navigate('/team'))}
        className="flex w-full items-center justify-between rounded-card bg-brand p-4 text-left font-display text-[16px] font-bold text-white"
      >
        For the Onpoint team <ArrowRight size={18} />
      </button>

      <button onClick={replay} className="btn-ghost w-full">
        <RotateCcw size={16} /> Replay Riya's story from day one
      </button>

      <section className="rounded-card bg-peach p-4">
        <p className="label !text-ink/60">Disclaimer</p>
        <p className="mt-1 text-[13px] leading-relaxed">{DISCLAIMER}</p>
      </section>
    </Screen>
  );
}
