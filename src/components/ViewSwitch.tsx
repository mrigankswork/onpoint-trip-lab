import { motion } from 'framer-motion';
import { useLab } from '../store/useLab';

const SIDES = [
  { id: 'app', label: 'The app' },
  { id: 'lab', label: 'Trip Lab' },
] as const;

/** The top-level switch: the app on its background, or the Trip Lab behind the numbers. */
export function ViewSwitch({ tone }: { tone: 'dark' | 'light' }) {
  const view = useLab((s) => s.view);
  const setView = useLab((s) => s.setView);
  const dark = tone === 'dark';
  return (
    <div
      role="tablist"
      aria-label="View"
      className={`relative flex rounded-full p-1 ${dark ? 'bg-white/10' : 'border border-ink/[0.1] bg-white'}`}
    >
      {SIDES.map((s) => {
        const on = view === s.id;
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={on}
            data-demo={`view-${s.id}`}
            onClick={() => setView(s.id)}
            className={`relative z-10 min-w-[104px] whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
              on ? (dark ? 'text-ink' : 'text-white') : dark ? 'text-white/70' : 'text-muted'
            }`}
          >
            {on && (
              <motion.span
                layoutId="view-pill"
                className={`absolute inset-0 -z-10 rounded-full ${dark ? 'bg-white' : 'bg-ink'}`}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            )}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
