import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import type { Brand } from '../data/brands';
import { fmtCountdown, fmtINR } from '../engine/format';
import { useNow } from '../hooks';
import { useEngine, useLab } from '../store/useLab';
import { Sticker } from './ui';

export function DropCard({ brand, rotate = -2 }: { brand: Brand; rotate?: number }) {
  const e = useEngine();
  const now = useNow(30_000);
  const highlight = useLab((s) => s.highlight) === `drop-${brand.id}`;
  const openCheckout = useLab((s) => s.openCheckout);
  const amount = brand.spend || 1000;
  const earn = e.earnFor(brand.id, amount, true);
  return (
    <motion.button
      data-demo={`drop-${brand.id}`}
      data-fly-src={brand.id}
      onClick={() => openCheckout(brand.id)}
      className="card relative w-[232px] shrink-0 p-4 text-left"
      animate={highlight ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgb(var(--brand-orange-rgb) / 0)', '0 0 0 6px rgb(var(--brand-orange-rgb) / 0.35)', '0 0 0 0 rgb(var(--brand-orange-rgb) / 0)'] } : { scale: 1 }}
      transition={highlight ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-xl font-bold leading-tight">{brand.name}</p>
          <p className="text-[12px] text-muted">{brand.category}</p>
        </div>
        <Sticker className="bg-orange text-white" rotate={rotate}>
          {e.v.dropsMultiplier}x Drop
        </Sticker>
      </div>
      <p className="mt-3 text-[13px] font-semibold text-orange">
        +{fmtINR(earn)} toward {e.dest.name} on {fmtINR(amount)}
      </p>
      <p className="mt-1 flex items-center gap-1 text-[12px] text-muted">
        <Timer size={13} /> ends in {fmtCountdown((brand.dropEndsAt ?? now) - now)}
      </p>
    </motion.button>
  );
}
