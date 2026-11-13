import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fmtINR } from '../engine/format';
import { useLab } from '../store/useLab';

const COLOURS = ['var(--unlock)', 'var(--brand-pink)', 'var(--brand-orange)', 'var(--peach)', '#fff'];

/** A short confetti burst. Fires whenever `fire` changes to a new non-zero value. */
export function Confetti({ fire }: { fire: number }) {
  const reduced = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 90 + ((i * 37) % 90);
        return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 40, r: (i * 53) % 360, c: COLOURS[i % COLOURS.length] };
      }),
    [],
  );
  if (!fire || reduced) return null;
  return (
    <div key={fire} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute h-2.5 w-1.5 rounded-sm"
          style={{ background: b.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 140], opacity: [1, 1, 0], rotate: b.r }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/** Points flying from a brand tile into the goal bar (600ms). */
export function FlyLayer() {
  const fly = useLab((s) => s.fly);
  const setFly = useLab((s) => s.setFly);
  const root = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<{ key: number; from: [number, number]; to: [number, number]; points: number } | null>(null);

  useEffect(() => {
    if (!fly || !root.current) return;
    const host = root.current;
    const phone = host.closest('[data-phone]') ?? document.body;
    const src = phone.querySelector(`[data-fly-src="${fly.brandId}"]`);
    const target = phone.querySelector('[data-fly-target]');
    if (!src || !target) {
      setFly(null);
      return;
    }
    const base = host.getBoundingClientRect();
    const scale = base.width / host.offsetWidth || 1;
    const centre = (el: Element): [number, number] => {
      const r = el.getBoundingClientRect();
      return [(r.left + r.width / 2 - base.left) / scale, (r.top + r.height / 2 - base.top) / scale];
    };
    setPath({ key: fly.key, from: centre(src), to: centre(target), points: fly.points });
    const id = setTimeout(() => {
      setPath(null);
      setFly(null);
    }, 750);
    return () => clearTimeout(id);
  }, [fly, setFly]);

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-50" aria-hidden>
      <AnimatePresence>
        {path && (
          <motion.span
            key={path.key}
            className="absolute left-0 top-0 -ml-9 -mt-4 rounded-full bg-unlock px-3 py-1.5 font-display text-sm font-extrabold text-ink"
            initial={{ x: path.from[0], y: path.from[1], scale: 0.6, opacity: 0 }}
            animate={{ x: path.to[0], y: path.to[1], scale: [0.6, 1.15, 0.7], opacity: [0, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            +{fmtINR(path.points)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
