import { Link as LinkIcon, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { squadNudge } from '../../components/SquadStrip';
import { Avatar, Num, Screen, Sticker } from '../../components/ui';
import { squadMonths } from '../../engine/calc';
import { fmtINR, fmtInt, fmtMonths, fmtPct } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';

export default function Squad() {
  const e = useEngine();
  const squad = useLab((s) => s.squad);
  const activeDrops = useLab((s) => s.activeDrops);
  const joinFriend = useLab((s) => s.joinFriend);
  const showToast = useLab((s) => s.showToast);
  const [sheet, setSheet] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const size = squad.length;
  const groupGoal = e.cost * size;
  const joined = squad.filter((m) => m.joined);
  const pooled = joined.length * e.trip.balance;
  const waiting = squad.find((m) => !m.joined);

  const send = () => {
    setSheet(false);
    showToast(waiting ? `Invite sent to ${waiting.name}` : 'Invite link copied (demo)');
    if (!waiting) return;
    // In the story, the friend joins a moment later and the referral bonus lands.
    timer.current = setTimeout(() => {
      joinFriend(waiting.id);
      showToast(`${waiting.name} joined · +${fmtInt(e.v.referralBonus)} Onpoints`);
    }, 2200);
  };

  return (
    <Screen>
      <div className="flex items-start justify-between">
        <h1 className="font-display text-[22px] font-extrabold">Squad Pool</h1>
        <Sticker className="bg-pink text-white" rotate={3}>
          {joined.length} of {size} in
        </Sticker>
      </div>

      <section className="card p-4">
        <p className="label">Group goal · {e.dest.name} for {size}</p>
        <p className="mt-1 font-display text-[28px] font-extrabold leading-tight">
          <Num>{fmtINR(pooled)}</Num> <span className="text-[16px] font-bold text-muted">of {fmtINR(groupGoal)}</span>
        </p>
        <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-fg/10">
          {joined.map((m) => (
            <span
              key={m.id}
              title={m.name}
              style={{ width: `${Math.min(100 / size, (e.trip.balance / groupGoal) * 100)}%`, background: m.colour, transition: 'width 250ms ease-out' }}
              className="h-full border-r border-white last:border-r-0"
            />
          ))}
        </div>
        <p className="mt-3 text-[13px]">
          About <strong>{fmtMonths(squadMonths(e.v, e.cost, size))} months</strong> to the whole group trip, if everyone earns like Riya.
        </p>
      </section>

      <section className="card divide-y divide-ink/[0.06]">
        {squad.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3.5">
            <Avatar initials={m.initials} colour={m.colour} dim={!m.joined} />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold">
                {m.name}
                {m.isYou ? ' (you)' : ''}
              </span>
              <span className="block text-[12px] text-muted">
                {m.joined ? `${m.dropsCaught} Drops caught` : 'Invite pending'}
              </span>
            </span>
            <span className="text-right text-[13px] font-semibold">
              {m.joined ? (
                <>
                  <Num>{fmtINR(e.trip.balance)}</Num>
                  <span className="block text-[11px] font-normal text-muted">{fmtPct(e.trip.balance / groupGoal)} of the pool</span>
                </>
              ) : (
                <span className="text-muted">—</span>
              )}
            </span>
          </div>
        ))}
      </section>

      <p className="text-[13px] font-medium text-pink">{squadNudge(e, squad, activeDrops)}</p>

      <button data-demo="invite-btn" onClick={() => setSheet(true)} className="btn w-full !bg-pink">
        <Send size={16} /> Invite a friend · +{fmtInt(e.v.referralBonus)} Onpoints each
      </button>

      <p className="rounded-card bg-peach text-ink p-4 text-[13px] font-medium">
        Pooling doesn't make points faster. It makes the trip happen.
      </p>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Bring the gang">
        <div className="rounded-card p-4 text-white" style={{ background: e.dest.gradient }}>
          <p className="font-display text-lg font-bold">{e.title}</p>
          <p className="text-[13px] text-white/80">Riya saved you a seat. Join the pool and earn toward the same trip.</p>
          <p className="mt-3 flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-[12px]">
            <LinkIcon size={14} /> onpoint.example/squad/{e.dest.id}-gang
          </p>
        </div>
        <p className="mt-2 text-[11px] text-muted">Demo link. Nothing is sent.</p>
        <button data-demo="send-invite" onClick={send} className="btn mt-3 w-full !bg-pink">
          Send invite
        </button>
      </Sheet>
    </Screen>
  );
}
