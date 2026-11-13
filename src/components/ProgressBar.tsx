import { motion } from 'framer-motion';

/** Goal progress. The --unlock fill is used only here and on "Unlocked" states. */
export function ProgressBar({
  percent,
  pending = 0,
  marks = [],
  tone = 'dark',
  height = 14,
}: {
  percent: number;
  /** Extra percent that is tracked but still pending, drawn striped. */
  pending?: number;
  marks?: number[];
  tone?: 'dark' | 'light';
  height?: number;
}) {
  const pend = Math.max(0, Math.min(pending, 100 - percent));
  return (
    <div
      data-fly-target
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative w-full overflow-hidden rounded-full"
      style={{ height, background: tone === 'dark' ? 'rgb(255 255 255 / 0.2)' : 'rgb(var(--fg-rgb) / 0.1)' }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-unlock"
        style={{ width: `${percent}%`, transition: 'width 180ms ease-out' }}
      />
      {pend > 0 && (
        <motion.div
          className="stripes absolute inset-y-0"
          initial={{ width: 0 }}
          animate={{ width: `${pend}%`, left: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
      {marks.map((m) => (
        <span
          key={m}
          className="absolute inset-y-0 w-[2px]"
          style={{ left: `${m}%`, background: tone === 'dark' ? 'rgb(var(--ink-rgb) / 0.55)' : 'rgb(var(--fg-rgb) / 0.35)' }}
        />
      ))}
    </div>
  );
}
