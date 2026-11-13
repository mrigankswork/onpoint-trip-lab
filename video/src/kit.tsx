import React from 'react';
import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadDisplay } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadSans } from '@remotion/google-fonts/Inter';
import { C } from './constants';

export const DISPLAY = loadDisplay('normal', { weights: ['800'], subsets: ['latin'] }).fontFamily;
export const SANS = loadSans('normal', { weights: ['500', '600'], subsets: ['latin'] }).fontFamily;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const inOut = Easing.inOut(Easing.cubic);

/** Keyframes: [frame, value] pairs, eased in and out between each pair. */
export const kf = (f: number, pts: [number, number][], easing = inOut) =>
  pts.length === 1 ? pts[0][1] : interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), { ...clamp, easing });

/** 0 → 1 over `inFrames` from `from`, and back to 0 over `outFrames` before `to`. */
export const window01 = (f: number, from: number, to: number, inFrames = 12, outFrames = 8) =>
  Math.min(
    interpolate(f, [from, from + inFrames], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }),
    interpolate(f, [to - outFrames, to], [1, 0], clamp),
  );

export const useStage = () => {
  const { width, height } = useVideoConfig();
  return { W: width, H: height, vertical: height > width };
};

export const Background: React.FC<{ glowX: number; glowY: number; glow: number }> = ({ glowX, glowY, glow }) => {
  const f = useCurrentFrame();
  const { W, H } = useStage();
  const appear = interpolate(f, [20, 140], [0, 1], clamp);
  const blob = (colour: string, bx: number, by: number, size: number, phase: number) => (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: bx * W - size / 2 + Math.sin(f / 170 + phase) * 90,
        top: by * H - size / 2 + Math.cos(f / 210 + phase) * 70,
        borderRadius: '50%',
        background: colour,
        filter: 'blur(150px)',
        opacity: 0.5 * appear,
      }}
    />
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.ink, overflow: 'hidden' }}>
      {blob(C.brand, 0.2, 0.28, Math.max(W, H) * 0.5, 0)}
      {blob(C.orange, 0.88, 0.86, Math.max(W, H) * 0.32, 2)}
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          left: glowX - 380,
          top: glowY - 380,
          borderRadius: '50%',
          background: C.pink,
          filter: 'blur(170px)',
          opacity: 0.26 * glow,
        }}
      />
    </div>
  );
};

export type Seg = string | { t: string; c: string };

/** Bricolage lines that fade and slide up 24px, one after another. */
export const Title: React.FC<{
  lines: Seg[][];
  from: number;
  to: number;
  x: number;
  y: number;
  width: number;
  size?: number;
  align?: 'left' | 'center';
  sub?: string;
  stagger?: number;
}> = ({ lines, from, to, x, y, width, size = 84, align = 'left', sub, stagger = 7 }) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const line = (i: number, node: React.ReactNode, style: React.CSSProperties) => {
    const k = window01(f, from + i * stagger, to, 14, 8);
    return (
      <div key={i} style={{ opacity: k, transform: `translateY(${(1 - Math.min(1, k * 1.0)) * 24}px)`, ...style }}>
        {node}
      </div>
    );
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        transform: 'translateY(-50%)',
        textAlign: align,
        color: C.white,
        textShadow: `0 4px 40px ${C.ink}`,
      }}
    >
      {lines.map((segs, i) =>
        line(
          i,
          segs.map((s, j) => (typeof s === 'string' ? <span key={j}>{s}</span> : <span key={j} style={{ color: s.c }}>{s.t}</span>)),
          { fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: '-0.02em' },
        ),
      )}
      {sub && line(lines.length + 1, sub, { fontFamily: SANS, fontWeight: 500, fontSize: size * 0.4, marginTop: size * 0.32, opacity: 0.8 })}
    </div>
  );
};

/** A thin line from a point on the phone to a short pill label. */
export const Callout: React.FC<{
  from: number;
  to: number;
  ax: number;
  ay: number;
  lx: number;
  ly: number;
  text: string;
  side?: 'left' | 'right';
}> = ({ from, to, ax, ay, lx, ly, text, side = 'right' }) => {
  const f = useCurrentFrame();
  const { W, H } = useStage();
  if (f < from || f > to) return null;
  const draw = interpolate(f, [from, from + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fade = interpolate(f, [to - 8, to], [1, 0], clamp);
  const len = Math.hypot(lx - ax, ly - ay);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={ax} y1={ay} x2={lx} y2={ly} stroke={C.white} strokeWidth={2} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        <circle cx={ax} cy={ay} r={6 * draw} fill={C.white} />
      </svg>
      <Pill text={text} x={lx} y={ly} anchor={side === 'right' ? 'left' : 'right'} k={interpolate(f, [from + 6, from + 14], [0, 1], clamp)} />
    </div>
  );
};

export const Pill: React.FC<{ text: string; x: number; y: number; anchor?: 'left' | 'right' | 'center'; k?: number; size?: number; lime?: boolean }> = ({
  text,
  x,
  y,
  anchor = 'center',
  k = 1,
  size = 28,
  lime = false,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${anchor === 'left' ? '0%' : anchor === 'right' ? '-100%' : '-50%'}, -50%) scale(${0.9 + 0.1 * k})`,
      transformOrigin: anchor,
      opacity: k,
      whiteSpace: 'nowrap',
      fontFamily: SANS,
      fontWeight: 500,
      fontSize: size,
      color: lime ? C.ink : C.white,
      background: lime ? C.lime : 'rgba(255,255,255,0.12)',
      border: lime ? 'none' : '1.5px solid rgba(255,255,255,0.55)',
      borderRadius: 999,
      padding: `${size * 0.36}px ${size * 0.72}px`,
      backdropFilter: 'blur(12px)',
    }}
  >
    {text}
  </div>
);

export const Sticker: React.FC<{ text: string; x: number; y: number; at: number; to: number; colour?: string; rotate?: number; size?: number }> = ({
  text,
  x,
  y,
  at,
  to,
  colour = C.orange,
  rotate = -8,
  size = 64,
}) => {
  const f = useCurrentFrame();
  if (f < at || f > to) return null;
  const k = Math.min(interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) }), interpolate(f, [to - 8, to], [1, 0], clamp));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${k})`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size,
        color: C.white,
        background: colour,
        borderRadius: size * 0.28,
        padding: `${size * 0.12}px ${size * 0.4}px`,
        boxShadow: `0 16px 50px ${C.ink}`,
      }}
    >
      {text}
    </div>
  );
};

export const AvatarBubble: React.FC<{
  initials: string;
  colour: string;
  x: number;
  y: number;
  px: number;
  py: number;
  at: number;
  to: number;
  label?: string;
  seed: number;
}> = ({ initials, colour, x, y, px, py, at, to, label, seed }) => {
  const f = useCurrentFrame();
  const { W, H } = useStage();
  if (f < at || f > to) return null;
  const k = window01(f, at, to, 16, 10);
  const bx = x + Math.sin(f / 26 + seed) * 8;
  const by = y + Math.cos(f / 31 + seed) * 10 + (1 - k) * 60;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: k }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={bx} y1={by} x2={px} y2={py} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeDasharray="6 8" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: bx - 60,
          top: by - 60,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: colour,
          border: `4px solid ${C.white}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 42,
          color: C.white,
          boxShadow: `0 16px 50px ${C.ink}`,
        }}
      >
        {initials}
      </div>
      {label && <Pill text={label} x={bx} y={by + 96} lime k={interpolate(f, [at + 10, at + 18], [0, 1], clamp)} />}
    </div>
  );
};

/** Month label that swaps in clean steps. It never rolls. */
export const MonthChip: React.FC<{ steps: [number, string][]; x: number; y: number; from: number; to: number }> = ({ steps, x, y, from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  let i = 0;
  steps.forEach(([at], n) => {
    if (f >= at) i = n;
  });
  const last = i === steps.length - 1;
  const swap = interpolate(f, [steps[i][0], steps[i][0] + 5], [0.4, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%,-50%)',
        opacity: window01(f, from, to, 12, 8),
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 60,
        whiteSpace: 'nowrap',
        color: last ? C.ink : C.white,
        background: last ? C.lime : 'rgba(255,255,255,0.1)',
        border: last ? 'none' : '2px solid rgba(255,255,255,0.5)',
        borderRadius: 999,
        padding: '18px 44px',
      }}
    >
      <span style={{ opacity: swap }}>{steps[i][1]}</span>
    </div>
  );
};

export const Confetti: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 70) return null;
  const colours = [C.lime, C.pink, C.orange, C.peach, C.white];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 90 }, (_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const v = 14 + random(`v${i}`) * 26;
        const px = x + Math.cos(a) * v * t * 0.9;
        const py = y + Math.sin(a) * v * t * 0.7 - 9 * t + 0.42 * t * t;
        const s = 10 + random(`s${i}`) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px,
              top: py,
              width: s,
              height: s * 0.6,
              background: colours[i % colours.length],
              borderRadius: 3,
              transform: `rotate(${t * (6 + random(`r${i}`) * 14) + i * 40}deg)`,
              opacity: interpolate(t, [45, 70], [1, 0], clamp),
            }}
          />
        );
      })}
    </div>
  );
};
