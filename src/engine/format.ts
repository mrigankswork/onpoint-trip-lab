// Display rounding only. The engine never rounds.

import { ASSUMPTIONS, type AssumptionKey } from './assumptions';

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-IN');

const trim = (n: number, digits: number) => n.toFixed(digits).replace(/\.0+$/, '');

/** Rupees: whole numbers, lakh/crore above ₹1,00,000. */
export const fmtINR = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7, 2)} crore`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5, 1)} lakh`;
  return `${sign}₹${fmtInt(abs)}`;
};

/** Rupees with one decimal kept when it matters (e.g. CAC ₹287.5). */
export const fmtINRExact = (n: number) =>
  Number.isInteger(Math.round(n * 10) / 10) ? fmtINR(n) : `₹${(Math.round(n * 10) / 10).toLocaleString('en-IN')}`;

export const fmtMonths = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '—');

export const fmtPct = (fraction: number, digits = 0) => `${trim(fraction * 100, digits)}%`;

/** Trip progress: whole percent, never shows 100 until the trip is fully funded. */
export const fmtTripPct = (pct: number) => `${pct >= 100 ? 100 : Math.min(99, Math.round(pct))}%`;

export const fmtAssumption = (key: AssumptionKey, value: number): string => {
  const a = ASSUMPTIONS[key];
  if (a.display && value === a.value) return a.display;
  switch (a.unit) {
    case 'inr':
      return fmtINR(value);
    case 'inrMonth':
      return `${fmtINR(value)}/month`;
    case 'pct':
      return fmtPct(value, 1);
    case 'x':
      return `${trim(value, 1)}x`;
    case 'pts':
      return `${fmtInt(value)} Onpoints`;
    case 'ratio':
      return trim(value, 2);
    default:
      return fmtInt(value);
  }
};

export const fmtCountdown = (ms: number) => {
  const mins = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
};
