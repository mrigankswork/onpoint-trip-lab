import { MotionConfig } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { PhoneFrame } from './components/PhoneFrame';
import { PhoneScreen } from './components/PhoneScreen';
import { SidePanel } from './components/SidePanel';
import { CaptionOverlay } from './demo/CaptionOverlay';
import { DemoController } from './demo/DemoController';
import { useMedia } from './hooks';
import { IS_DEMO, LAYOUT_PARAM } from './store/useLab';

const PHONE = { w: 390, h: 844 };

/** A fixed-size design canvas scaled to fit the window. Used for the recording layouts. */
function Stage({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / w, window.innerHeight / h));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [w, h]);
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-ink">
      <div style={{ width: w * scale, height: h * scale }}>
        <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: '0 0' }}>{children}</div>
      </div>
    </div>
  );
}

/** Phone frame on the left, side panel on the right. */
function Desktop() {
  const col = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = col.current!;
    const fit = () =>
      setScale(Math.min(1, (el.clientHeight - 32 - (IS_DEMO ? 92 : 0)) / PHONE.h, (el.clientWidth - 32) / PHONE.w));
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, []);
  return (
    <div className="flex h-full w-full">
      <div
        ref={col}
        className="flex h-full w-[42%] min-w-[400px] max-w-[620px] shrink-0 flex-col items-center justify-center gap-4 overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 42%, rgb(var(--brand-rgb) / 0.6), var(--ink) 72%)' }}
      >
        <div style={{ width: PHONE.w * scale, height: PHONE.h * scale }}>
          <div style={{ width: PHONE.w, height: PHONE.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
            <PhoneFrame>
              <PhoneScreen />
            </PhoneFrame>
          </div>
        </div>
        {IS_DEMO && (
          <div className="w-[88%]">
            <CaptionOverlay variant="bar" />
          </div>
        )}
      </div>
      <div className="h-full min-w-0 flex-1 bg-canvas text-ink">
        <SidePanel />
      </div>
    </div>
  );
}

function Shell() {
  const wide = useMedia('(min-width: 900px)');
  const layout = LAYOUT_PARAM ?? (wide ? 'desktop' : 'mobile');
  const hasPanel = layout === 'desktop' || layout === 'landscape';

  let body: ReactNode;
  if (layout === 'landscape') {
    // 16:9 canvas: fills a 1920 × 1080 window exactly.
    body = (
      <Stage w={1600} h={900}>
        <Desktop />
      </Stage>
    );
  } else if (layout === 'portrait') {
    // 9:16 canvas: fills a 1080 × 1920 window exactly. Phone alone, captions across the top.
    body = (
      <Stage w={450} h={800}>
        <div className="flex h-full flex-col bg-ink">
          {IS_DEMO && <CaptionOverlay variant="top" />}
          <div className="min-h-0 flex-1">
            <PhoneScreen />
          </div>
        </div>
      </Stage>
    );
  } else if (layout === 'desktop') {
    body = (
      <div className="h-full">
        <Desktop />
      </div>
    );
  } else {
    body = (
      <div className="h-[100dvh]">
        <PhoneScreen />
        {IS_DEMO && (
          <div className="pointer-events-none fixed inset-x-3 bottom-[76px] z-[60] overflow-hidden rounded-2xl">
            <CaptionOverlay variant="top" />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {body}
      {IS_DEMO && <DemoController hasPanel={hasPanel} />}
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Shell />
      </HashRouter>
    </MotionConfig>
  );
}
