import { brandById } from '../data/brands';
import type { SquadMember } from '../data/squad';
import { useEngine, useLab, type Derived } from '../store/useLab';
import { Avatar } from './ui';

export function RingAvatar({ member, percent, size = 44 }: { member: SquadMember; percent: number; size?: number }) {
  const p = member.joined ? percent : 0;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size + 10,
        height: size + 10,
        background: `conic-gradient(var(--brand-pink) ${p * 3.6}deg, rgb(var(--ink-rgb) / 0.08) 0)`,
      }}
    >
      <span className="flex items-center justify-center rounded-full bg-white" style={{ width: size + 4, height: size + 4 }}>
        <Avatar initials={member.initials} colour={member.colour} size={size} dim={!member.joined} />
      </span>
    </span>
  );
}

/** One honest nudge, worked out from the engine: how many Drop orders to the next unlock. */
export function squadNudge(e: Derived, squad: SquadMember[], activeDrops: string[]) {
  const waiting = squad.find((m) => !m.joined);
  if (waiting) return `${waiting.name} hasn't joined yet. Send a nudge?`;
  if (!e.next) return "Everyone's fully funded. Pack your bags.";
  const drop = brandById(activeDrops[0] ?? 'myntra');
  const perDrop = e.earnFor(drop.id, drop.spend || 1000, true);
  const n = Math.max(1, Math.ceil((e.next.threshold - e.trip.balance) / perDrop));
  const noun = e.next.key === 'travel' ? e.dest.travelNoun : e.next.key;
  const friend = squad[squad.length - 1];
  return `${friend.name} is ${n} ${n === 1 ? 'Drop' : 'Drops'} away from the ${noun}`;
}

export function SquadStrip() {
  const e = useEngine();
  const squad = useLab((s) => s.squad);
  const activeDrops = useLab((s) => s.activeDrops);
  return (
    <div>
      <div className="flex items-center gap-2">
        {squad.map((m) => (
          <RingAvatar key={m.id} member={m} percent={e.trip.percent} />
        ))}
      </div>
      <p className="mt-3 text-[13px] font-medium text-pink">{squadNudge(e, squad, activeDrops)}</p>
    </div>
  );
}
