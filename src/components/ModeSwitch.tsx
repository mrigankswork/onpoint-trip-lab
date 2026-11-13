import { motion } from 'framer-motion';
import type { Mode } from '../engine/calc';
import { useFlip } from '../hooks';
import { useLab } from '../store/useLab';

const SIDES: { mode: Mode; label: string }[] = [
  { mode: 'today', label: 'Today' },
  { mode: 'trip', label: 'With TRIP' },
];

export function ModeSwitch() {
  const mode = useLab((s) => s.mode);
  const flip = useFlip();
  return (
    <div role="tablist" aria-label="Product mode" className="relative flex rounded-full border border-ink/[0.1] bg-white p-1">
      {SIDES.map((s) => {
        const on = mode === s.mode;
        return (
          <button
            key={s.mode}
            role="tab"
            aria-selected={on}
            data-demo={`mode-${s.mode}`}
            onClick={() => flip(s.mode)}
            className={`relative z-10 min-w-[84px] whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${on ? 'text-white' : 'text-muted'}`}
          >
            {on && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 -z-10 rounded-full bg-brand"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            )}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
