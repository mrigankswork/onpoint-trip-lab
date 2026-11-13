import { DISCLAIMER } from '../data/persona';

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`px-4 pb-4 pt-1 text-center text-[10px] leading-snug text-muted ${className}`}>{DISCLAIMER}</p>
  );
}
