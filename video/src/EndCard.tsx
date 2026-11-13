import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, END } from './constants';
import { DISPLAY, SANS, useStage } from './kit';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { W, vertical } = useStage();
  const up = (at: number) => {
    const k = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return { opacity: k, transform: `translateY(${(1 - k) * 24}px)` };
  };
  const draw = interpolate(f, [4, 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fill = interpolate(f, [18, 28], [0, 1], clamp);
  const footer = ['Concept prototype', 'Ascend 3.0', END.team, END.link].filter(Boolean).join('  ·  ');
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 44,
        color: C.white,
        opacity: interpolate(f, [0, 10], [0, 1], clamp),
      }}
    >
      {/* A simple original wing mark. Not the Onpoint logo. */}
      <div style={{ width: 132, height: 132, borderRadius: 36, background: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={76} height={76} viewBox="0 0 24 24">
          <path
            d="M2 13 22 3l-6.5 18-3.6-7.2z"
            fill={C.white}
            fillOpacity={fill}
            stroke={C.white}
            strokeWidth={1}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - draw}
          />
        </svg>
      </div>
      <div style={{ ...up(18), fontFamily: DISPLAY, fontWeight: 800, fontSize: vertical ? 92 : 104, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.04, maxWidth: W * 0.86 }}>
        {END.line}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, maxWidth: W * 0.9 }}>
        {END.pillars.map((p, i) => (
          <div
            key={p}
            style={{
              ...up(30 + i * 4),
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 30,
              padding: '12px 26px',
              borderRadius: 999,
              border: '1.5px solid rgba(255,255,255,0.5)',
            }}
          >
            {p}
          </div>
        ))}
      </div>
      <div style={{ ...up(50), fontFamily: SANS, fontWeight: 500, fontSize: 24, opacity: up(50).opacity * 0.65, textAlign: 'center', maxWidth: W * 0.86 }}>
        {footer}
        <div style={{ marginTop: 10, fontSize: 19 }}>Not affiliated with or endorsed by Onpoints Rewards Pvt Ltd. All user data is fictional.</div>
      </div>
    </div>
  );
};
