import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Disclaimer } from './Disclaimer';

/** A number that updates with a clean 150ms crossfade. No rolling, no flashing. */
export function Num({ children, className = '' }: { children: string | number; className?: string }) {
  return (
    <motion.span
      key={String(children)}
      className={className}
      initial={{ opacity: 0.35 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.span>
  );
}

export function Avatar({
  initials,
  colour,
  size = 40,
  dim = false,
}: {
  initials: string;
  colour: string;
  size?: number;
  dim?: boolean;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white"
      style={{ width: size, height: size, background: colour, fontSize: size * 0.36, opacity: dim ? 0.35 : 1 }}
    >
      {initials}
    </span>
  );
}

/** Scrollable screen body with the disclaimer as its footer. */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`no-scrollbar flex h-full flex-col overflow-y-auto ${className}`}>
      <div className="flex-1 space-y-3 px-4 pb-5 pt-3">{children}</div>
      <Disclaimer />
    </div>
  );
}

export function Sticker({
  children,
  className = '',
  rotate = -2,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <span className={`sticker ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      {children}
    </span>
  );
}

/** Original arrow/wing mark that echoes the Onpoint logo. Not the logo file. */
export function WingMark({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M2 13 22 3l-6.5 18-3.6-7.2z" fill="currentColor" />
    </svg>
  );
}
