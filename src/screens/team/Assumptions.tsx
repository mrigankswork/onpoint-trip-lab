import { useState } from 'react';
import { SourceTag } from '../../components/SourceTag';
import { destinations } from '../../data/destinations';
import { ASSUMPTIONS, TRIP_NOTES, type Assumption, type AssumptionKey, type Tag } from '../../engine/assumptions';
import { tripCost } from '../../engine/calc';
import { fmtAssumption, fmtINR } from '../../engine/format';
import { useEngine, useLab } from '../../store/useLab';
import { StatusChip } from './parts';

const FILTERS: ('All' | Tag)[] = ['All', 'Case fact', 'Public source', 'Team assumption'];

interface Row {
  key: string;
  value: string;
  tag: Tag;
  note: string;
  custom?: string;
}

const linkify = (note: string) =>
  note.split(/(https?:\/\/\S+?)(?=[),.]?(?:\s|$))/).map((part, i) =>
    part.startsWith('http') ? (
      <a key={i} href={part} target="_blank" rel="noreferrer" className="break-all text-brand underline">
        {part}
      </a>
    ) : (
      part
    ),
  );

export default function Assumptions() {
  const e = useEngine();
  const overrides = useLab((s) => s.assumptionOverrides);
  const destinationId = useLab((s) => s.destinationId);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const rows: Row[] = [
    ...(Object.entries(ASSUMPTIONS) as [AssumptionKey, Assumption][]).map(([key, a]) => ({
      key,
      value: fmtAssumption(key, e.v[key]),
      tag: a.tag,
      note: a.note,
      custom: key in overrides ? fmtAssumption(key, a.value) : undefined,
    })),
    ...destinations.map((d) => ({
      key: `tripCost.${d.id}`,
      value: `${fmtINR(tripCost(d.pieces))}/person${d.id === destinationId ? ' (selected)' : ''}`,
      tag: 'Team assumption' as Tag,
      note: TRIP_NOTES[d.id],
    })),
  ];
  const shown = rows.filter((r) => filter === 'All' || r.tag === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-extrabold">Assumptions</h2>
        <StatusChip />
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${filter === f ? 'bg-ink text-white' : 'border border-ink/[0.12] bg-white'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-ink/[0.08] text-[11px] uppercase tracking-wider text-muted">
              <th className="p-3 font-semibold">Key</th>
              <th className="p-3 font-semibold">Value</th>
              <th className="p-3 font-semibold">Tag</th>
              <th className="p-3 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.key} className="border-b border-ink/[0.05] align-top last:border-0">
                <td className="p-3 font-mono text-[11.5px]" style={{ fontFamily: 'inherit' }}>
                  <code className="font-sans font-semibold">{r.key}</code>
                </td>
                <td className="whitespace-nowrap p-3 font-semibold">
                  {r.value}
                  {r.custom && (
                    <span className="mt-0.5 block text-[11px] font-semibold text-orange">Custom · default {r.custom}</span>
                  )}
                </td>
                <td className="p-3">
                  <SourceTag tag={r.tag} />
                </td>
                <td className="p-3 text-muted">{linkify(r.note)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
