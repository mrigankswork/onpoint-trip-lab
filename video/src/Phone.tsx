import React from 'react';
import { C, SCREEN } from './constants';

const EDGE = 4; // titanium edge
const BEZEL = 9; // black border around the display
export const BODY = { w: SCREEN.w + 2 * (EDGE + BEZEL), h: SCREEN.h + 2 * (EDGE + BEZEL) };

/** An iPhone Pro-style body drawn in CSS. The footage already carries the status bar and Dynamic Island. */
export const Phone3D: React.FC<{
  x: number;
  y: number;
  scale: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({ x, y, scale, rotateX = 0, rotateY = 0, rotateZ = 0, opacity = 1, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, perspective: 2400, opacity }}>
    {/* soft shadow under the phone */}
    <div
      style={{
        position: 'absolute',
        left: (-BODY.w * scale) / 2,
        top: (BODY.h * scale) / 2 - 40 * scale,
        width: BODY.w * scale,
        height: 90 * scale,
        borderRadius: '50%',
        background: C.ink,
        filter: `blur(${40 * scale}px)`,
        opacity: 0.8,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: -BODY.w / 2,
        top: -BODY.h / 2,
        width: BODY.w,
        height: BODY.h,
        transform: `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        borderRadius: SCREEN.r + EDGE + BEZEL,
        padding: EDGE,
        // titanium: neutral greys only, lit from the top left
        background: 'linear-gradient(135deg, #d9d6d0 0%, #8d8a85 22%, #55524e 50%, #a5a29c 78%, #e4e1db 100%)',
        boxShadow: `0 40px 120px rgba(1,0,13,0.75), 0 0 0 1px rgba(255,255,255,0.08)`,
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: SCREEN.r + BEZEL, padding: BEZEL, background: '#000' }}>
        <div style={{ position: 'relative', width: SCREEN.w, height: SCREEN.h, borderRadius: SCREEN.r, overflow: 'hidden', background: C.ink }}>
          {children}
          {/* glass reflection that moves with the camera */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(112deg, transparent ${28 + rotateY * 3}%, rgba(255,255,255,0.09) ${44 + rotateY * 3}%, transparent ${58 + rotateY * 3}%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  </div>
);
