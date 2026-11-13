import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLab } from '../store/useLab';

export function Toast() {
  const toast = useLab((s) => s.toast);
  const clear = useLab((s) => s.clearToast);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clear, 2800);
    return () => clearTimeout(id);
  }, [toast, clear]);
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: 'calc(max(8px, var(--safe-bottom, env(safe-area-inset-bottom, 0px))) + 68px)' }}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            className="rounded-full bg-fg px-4 py-2.5 text-center text-[13px] font-semibold text-canvas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
