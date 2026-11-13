import type { ReactNode } from 'react';

/** A 390 × 844 phone frame for desktop and landscape recording. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-[52px] border-[10px] border-ink bg-ink"
      style={{ width: 390, height: 844, boxShadow: '0 0 0 2px rgb(255 255 255 / 0.14), 0 0 120px rgb(var(--brand-rgb) / 0.55)' }}
    >
      <div className="h-full w-full overflow-hidden rounded-[42px] bg-canvas">{children}</div>
    </div>
  );
}
