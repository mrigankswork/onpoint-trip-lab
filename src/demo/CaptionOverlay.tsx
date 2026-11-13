import { AnimatePresence, motion } from 'framer-motion';
import { demoScript } from '../data/demoScript';
import { useLab } from '../store/useLab';

/** One short caption per step. Display font, white on --ink at 85% opacity. */
export function CaptionOverlay({ variant }: { variant: 'bar' | 'top' }) {
  const step = useLab((s) => s.demoStep);
  const hidden = useLab((s) => s.captionsHidden);
  if (hidden) return variant === 'top' ? <div className="h-[72px] shrink-0" /> : null;
  const s = demoScript[step];
  return (
    <div
      className={`flex shrink-0 items-center justify-center px-4 text-center text-white ${
        variant === 'top' ? 'h-[72px]' : 'min-h-[68px] rounded-2xl border border-white/10 py-3'
      }`}
      style={{ background: 'rgb(var(--ink-rgb) / 0.85)' }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className={`font-display font-bold leading-snug ${variant === 'top' ? 'text-[17px]' : 'text-[19px]'}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {s.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
