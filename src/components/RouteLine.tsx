import { useLayoutEffect, useRef, useState } from 'react';
import { WingMark } from './ui';

const PATH = 'M26 96 C 90 96, 110 20, 180 36 S 270 60, 296 24';
// The wing mark points up-right by default; this is its resting angle in degrees.
const WING_REST = -27;

/** The trip route with the wing marker gliding to the current progress. */
export function RouteLine({ percent, from, to }: { percent: number; from: string; to: string }) {
  const ref = useRef<SVGPathElement>(null);
  const [pos, setPos] = useState({ x: 26, y: 96, angle: 0 });

  useLayoutEffect(() => {
    const path = ref.current;
    if (!path) return;
    const total = path.getTotalLength();
    const at = (total * Math.max(0, Math.min(100, percent))) / 100;
    const p = path.getPointAtLength(at);
    const q = path.getPointAtLength(Math.min(total, at + 2));
    const r = path.getPointAtLength(Math.max(0, at - 2));
    setPos({ x: p.x, y: p.y, angle: (Math.atan2(q.y - r.y, q.x - r.x) * 180) / Math.PI });
  }, [percent]);

  return (
    <div className="relative">
      <svg viewBox="0 0 320 120" className="block w-full" aria-hidden>
        <path d={PATH} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        <path
          ref={ref}
          d={PATH}
          fill="none"
          stroke="var(--unlock)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${percent} 100`}
          style={{ transition: 'stroke-dasharray 250ms ease-out' }}
        />
        <circle cx="26" cy="96" r="6" fill="#fff" />
        <circle cx="296" cy="24" r="7" fill="none" stroke="#fff" strokeWidth="3" />
      </svg>
      <span
        className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white"
        style={{
          left: `${(pos.x / 320) * 100}%`,
          top: `${(pos.y / 120) * 100}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 250ms ease-out, top 250ms ease-out',
          boxShadow: '0 0 0 2px #fff',
        }}
      >
        <span style={{ transform: `rotate(${pos.angle - WING_REST}deg)`, transition: 'transform 250ms ease-out', display: 'flex' }}>
          <WingMark size={16} />
        </span>
      </span>
      <span className="absolute bottom-0 left-1 text-[11px] font-semibold text-white/80">{from}</span>
      <span className="absolute right-0 top-9 text-[11px] font-semibold text-white">{to}</span>
    </div>
  );
}
