import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { STAGES, orderStage, type Order } from '../store/useLab';

// Illustrative gaps between stages, in minutes after the click.
const OFFSET_MIN = [0, 2, 5];

const time = (ms: number) => new Date(ms).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

export function stageTime(order: Order, i: number) {
  if (order.createdAt === 0) return 'Earlier this month';
  if (i < OFFSET_MIN.length) return time(order.createdAt + OFFSET_MIN[i] * 60_000);
  return 'After the return window';
}

export function TrackingTimeline({ order, now }: { order: Order; now: number }) {
  const stage = orderStage(order, now);
  return (
    <ol className="relative">
      {STAGES.map((label, i) => {
        const done = i <= stage;
        const current = i === stage;
        return (
          <li key={label} className="relative flex gap-3 pb-5 last:pb-0">
            {i < STAGES.length - 1 && (
              <span className={`absolute left-[13px] top-7 h-[calc(100%-28px)] w-[2px] ${i < stage ? 'bg-brand' : 'bg-ink/10'}`} />
            )}
            <motion.span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                done ? 'border-brand bg-brand text-white' : 'border-ink/15 bg-white text-transparent'
              }`}
              animate={current ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Check size={14} strokeWidth={3} />
            </motion.span>
            <div className="-mt-0.5">
              <p className={`text-[14px] font-semibold ${done ? 'text-ink' : 'text-muted'}`}>{label}</p>
              <p className="text-[12px] text-muted">{done ? stageTime(order, i) : 'Waiting'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
