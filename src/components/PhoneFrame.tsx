import { BatteryFull, Signal, Wifi } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNow } from '../hooks';
import { useLab } from '../store/useLab';

// iPhone 18 Pro: 2622 × 1206 pixels at 3x = 402 × 874 points.
export const SCREEN = { w: 402, h: 874 };
// Display corner radius and safe areas follow the 6.3-inch Pro layout.
const CORNER = 62;
const BEZEL = 5;
const SAFE_TOP = 59;
const SAFE_BOTTOM = 26;
const DEVICE = { w: SCREEN.w + BEZEL * 2, h: SCREEN.h + BEZEL * 2 };

/**
 * An iPhone 18 Pro-sized device. It fits itself to its parent: full size when there is
 * room, zoomed down evenly when there is not, so the screen never loses its proportions.
 * The app reads --safe-top / --safe-bottom to stay clear of the island and home indicator.
 */
export function PhoneFrame({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const now = useNow(20_000);
  const theme = useLab((s) => s.theme);

  useEffect(() => {
    const el = box.current!;
    const fit = () => setZoom(Math.min(1, (el.clientHeight - 12) / DEVICE.h, (el.clientWidth - 12) / DEVICE.w));
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, []);

  // bare: the screen alone at the full viewport, for clip capture. The video draws its own bezel.
  const time = bare
    ? '9:41'
    : new Date(now).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: false });

  return (
    <div ref={box} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative shrink-0 bg-ink"
        style={
          bare
            ? { width: '100%', height: '100%' }
            : {
                width: DEVICE.w,
                height: DEVICE.h,
                padding: BEZEL,
                zoom,
                borderRadius: CORNER + BEZEL,
                boxShadow:
                  '0 0 0 2px rgb(var(--muted-rgb) / 0.7), 0 0 0 3px rgb(var(--ink-rgb) / 0.9), 0 30px 120px rgb(var(--brand-rgb) / 0.6)',
              }
        }
      >
        <div
          data-theme={theme}
          className="relative h-full w-full overflow-hidden bg-canvas"
          style={
            {
              borderRadius: bare ? 0 : CORNER,
              '--safe-top': `${SAFE_TOP}px`,
              '--safe-bottom': `${SAFE_BOTTOM}px`,
            } as CSSProperties
          }
        >
          {children}

          {/* Status bar, Dynamic Island and home indicator: device chrome, not part of the app. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[70] flex items-center justify-between px-9 text-fg"
            style={{ height: SAFE_TOP }}
          >
            <span className="w-[54px] text-center text-[16px] font-semibold">{time}</span>
            <span className="flex w-[70px] items-center justify-end gap-1.5">
              <Signal size={16} strokeWidth={2.6} />
              <Wifi size={16} strokeWidth={2.6} />
              <BatteryFull size={22} strokeWidth={2} />
            </span>
          </div>
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[12px] z-[70] h-[35px] w-[122px] -translate-x-1/2 rounded-full bg-ink" />
          <div aria-hidden className="pointer-events-none absolute bottom-[8px] left-1/2 z-[70] h-[5px] w-[140px] -translate-x-1/2 rounded-full bg-fg/80" />
        </div>
      </div>
    </div>
  );
}
