import type { ReactNode } from 'react';

/** A phone frame up to 390 × 844. It fills its parent's height, so it never needs scaling. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative h-full max-h-[844px] shrink-0 overflow-hidden rounded-[52px] border-[10px] border-ink bg-ink"
      style={{ width: 390, boxShadow: '0 0 0 2px rgb(255 255 255 / 0.14), 0 0 120px rgb(var(--brand-rgb) / 0.55)' }}
    >
      <div className="h-full w-full overflow-hidden rounded-[42px] bg-canvas">{children}</div>
    </div>
  );
}
