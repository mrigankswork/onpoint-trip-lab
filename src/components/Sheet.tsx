import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** The phone screen's overlay layer. Sheets portal into it so they stay inside the phone. */
export const OverlayContext = createContext<HTMLElement | null>(null);

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const host = useContext(OverlayContext);
  if (!host) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="pointer-events-auto absolute inset-0 flex items-end">
          <motion.button
            aria-label="Close"
            className="no-press absolute inset-0 bg-ink/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-label={title}
            className="relative w-full rounded-t-[28px] bg-surface p-5"
            style={{ paddingBottom: 'calc(max(8px, var(--safe-bottom, env(safe-area-inset-bottom, 0px))) + 16px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{title}</h2>
              <button data-demo="sheet-close" aria-label="Close" onClick={onClose} className="rounded-full bg-canvas p-2">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    host,
  );
}
