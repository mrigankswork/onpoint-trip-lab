import { MotionConfig, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { LabView, preloadLab } from './components/LabView';
import { PhoneFrame } from './components/PhoneFrame';
import { PhoneScreen } from './components/PhoneScreen';
import { ViewSwitch } from './components/ViewSwitch';
import { CaptionOverlay } from './demo/CaptionOverlay';
import { DemoController } from './demo/DemoController';
import { useLayout } from './hooks';
import { IS_DEMO, useLab } from './store/useLab';

const BACKDROP = 'radial-gradient(circle at 50% 42%, rgb(var(--brand-rgb) / 0.6), var(--ink) 72%)';
// Views fade in on entry only. Nothing waits on an exit animation, so a switch can never stall.
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } };

/** A fixed-size design canvas scaled to fit the window. Used only for the recording layouts. */
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

/** Desktop: one top bar with the App / Trip Lab switch, and one view at a time below it. */
function Desktop() {
  const view = useLab((s) => s.view);
  const dark = view === 'app';
  return (
    <div className="flex h-full flex-col transition-colors duration-200" style={{ background: dark ? 'var(--ink)' : 'var(--canvas)' }}>
      <header
        className={`relative z-10 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 ${
          dark ? 'text-white' : 'border-b border-ink/[0.08] text-ink'
        }`}
      >
        <span />
        <ViewSwitch tone={dark ? 'dark' : 'light'} />
        <span />
      </header>
      <main className="relative min-h-0 flex-1">
          {view === 'app' ? (
            <motion.div
              key="app"
              {...fade}
              className="absolute inset-0 px-4 pt-1"
              style={{ background: BACKDROP, paddingBottom: IS_DEMO ? 100 : 14 }}
            >
              <PhoneFrame>
                <PhoneScreen />
              </PhoneFrame>
            </motion.div>
          ) : (
            <motion.div key="lab" {...fade} className="absolute inset-0">
              <LabView chrome="desktop" />
            </motion.div>
          )}
      </main>
      {IS_DEMO && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] mx-auto w-[min(640px,92vw)]">
          <CaptionOverlay variant="bar" />
        </div>
      )}
    </div>
  );
}

/** Landscape recording layout: phone and Lab side by side on a 16:9 canvas. */
function SideBySide() {
  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-[40%] shrink-0 flex-col items-center gap-3 overflow-hidden p-3" style={{ background: BACKDROP }}>
        <div className="min-h-0 w-full flex-1">
          <PhoneFrame>
            <PhoneScreen />
          </PhoneFrame>
        </div>
        {IS_DEMO && (
          <div className="w-[92%] shrink-0">
            <CaptionOverlay variant="bar" />
          </div>
        )}
      </div>
      <div className="h-full min-w-0 flex-1">
        <LabView chrome="beside-phone" />
      </div>
    </div>
  );
}

/** Phone-sized layouts: the app fills the screen, and the Lab replaces it when opened. */
function Handheld() {
  const view = useLab((s) => s.view);
  return (
    <>
      {view === 'app' ? (
        <motion.div key="app" {...fade} className="h-full">
          <PhoneScreen labButton />
        </motion.div>
      ) : (
        <motion.div key="lab" {...fade} className="h-full">
          <LabView chrome="mobile" />
        </motion.div>
      )}
    </>
  );
}

function Shell() {
  const layout = useLayout();

  // Fetch the Lab's charts once the app has settled, so switching views is instant.
  useEffect(() => {
    const id = setTimeout(preloadLab, 2500);
    return () => clearTimeout(id);
  }, []);

  let body: ReactNode;
  if (layout === 'landscape') {
    // 16:9 canvas: fills a 1920 × 1080 window exactly.
    body = (
      <Stage w={1600} h={900}>
        <SideBySide />
      </Stage>
    );
  } else if (layout === 'portrait') {
    // 9:16 canvas: fills a 1080 × 1920 window exactly. Captions across the top.
    body = (
      <Stage w={450} h={800}>
        <div className="flex h-full flex-col bg-ink">
          {IS_DEMO && <CaptionOverlay variant="top" />}
          <div className="min-h-0 flex-1">
            <Handheld />
          </div>
        </div>
      </Stage>
    );
  } else if (layout === 'bare') {
    // Clip capture: the app screen alone, with its status bar and safe areas, at the full viewport.
    body = (
      <div className="h-[100dvh]">
        <PhoneFrame bare>
          <PhoneScreen />
        </PhoneFrame>
      </div>
    );
  } else if (layout === 'desktop') {
    body = (
      <div className="h-full">
        <Desktop />
      </div>
    );
  } else {
    body = (
      <div className="h-[100dvh] bg-canvas">
        <Handheld />
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
      {IS_DEMO && <DemoController sideBySide={layout === 'landscape'} />}
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
