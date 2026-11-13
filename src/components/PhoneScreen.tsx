import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { fmtMonths } from '../engine/format';
import { TRIP_PATHS } from '../hooks';
import Checkout from '../screens/app/Checkout';
import Home from '../screens/app/Home';
import Onboarding from '../screens/app/Onboarding';
import Profile from '../screens/app/Profile';
import Shop from '../screens/app/Shop';
import Squad from '../screens/app/Squad';
import TodayHome from '../screens/app/TodayHome';
import TodayRedeem from '../screens/app/TodayRedeem';
import Tracking from '../screens/app/Tracking';
import TripGoal from '../screens/app/TripGoal';
import Unlock from '../screens/app/Unlock';
import Wrapped from '../screens/app/Wrapped';
import { useLab } from '../store/useLab';
import { FlyLayer } from './Effects';
import { ModeSwitch } from './ModeSwitch';
import { MonthSlider } from './MonthSlider';
import { OverlayContext, Sheet } from './Sheet';
import { TabBar } from './TabBar';
import { Toast } from './Toast';

import TeamRoute from '../screens/team/TeamRoute';
import { WingMark } from './ui';

function Index() {
  const mode = useLab((s) => s.mode);
  return <Navigate to={mode === 'today' ? '/today' : '/home'} replace />;
}

/** With TRIP screens need a trip. Before onboarding, they lead to it. */
function Trip({ children }: { children: JSX.Element }) {
  const onboarded = useLab((s) => s.onboarded);
  return onboarded ? children : <Navigate to="/onboarding" replace />;
}

/** The app itself. `labButton` adds a way into the Trip Lab where there is no top bar (phones). */
export function PhoneScreen({ labButton = false }: { labButton?: boolean }) {
  const [overlay, setOverlay] = useState<HTMLElement | null>(null);
  const location = useLocation();
  const { pathname } = location;
  const month = useLab((s) => s.month);
  const lastNav = useLab((s) => s.lastNav);
  const setLastNav = useLab((s) => s.setLastNav);
  const setMode = useLab((s) => s.setMode);
  const monthSheet = useLab((s) => s.monthSheet);
  const setMonthSheet = useLab((s) => s.setMonthSheet);
  const setView = useLab((s) => s.setView);

  // The route decides the mode, so deep links and tab taps stay consistent with the switch.
  useEffect(() => {
    if (pathname.startsWith('/today')) setMode('today');
    else if (TRIP_PATHS.includes(pathname)) setMode('trip');
    const id = setTimeout(() => setLastNav('nav'), 350);
    return () => clearTimeout(id);
  }, [pathname, setMode, setLastNav]);

  const flip = lastNav === 'flip';
  const showTabs = pathname !== '/onboarding';

  return (
    <div data-phone className="relative flex h-full w-full flex-col overflow-hidden bg-canvas text-ink">
      <header
        className="z-30 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-ink/[0.06] bg-canvas px-4 pb-2.5"
        style={{ paddingTop: 'max(10px, calc(var(--safe-top, env(safe-area-inset-top, 0px)) + 4px))' }}
      >
        <div className="flex justify-start">
          {labButton ? (
            <button
              data-demo="open-lab"
              onClick={() => setView('lab')}
              aria-label="Open the Trip Lab"
              className="flex items-center gap-1 whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-1.5 text-[12px] font-bold text-brand"
            >
              <WingMark size={12} /> Lab
            </button>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand text-white" aria-label="Onpoint Trip Lab">
              <WingMark size={15} />
            </span>
          )}
        </div>
        <ModeSwitch />
        <div className="flex justify-end">
          <button
            onClick={() => setMonthSheet(true)}
            aria-label={`M${fmtMonths(month)}: change simulated month`}
            className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink ring-1 ring-ink/[0.08]"
          >
            <Clock size={14} />M{fmtMonths(month)}
          </button>
        </div>
      </header>

      <OverlayContext.Provider value={overlay}>
        <div className="relative min-h-0 flex-1">
          <motion.div
            key={pathname}
            className="absolute inset-0"
            initial={flip ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: flip ? 0.3 : 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/today" element={<TodayHome />} />
                <Route path="/today/redeem" element={<TodayRedeem />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/home" element={<Trip><Home /></Trip>} />
                <Route path="/goal" element={<Trip><TripGoal /></Trip>} />
                <Route path="/shop" element={<Trip><Shop /></Trip>} />
                <Route path="/tracking" element={<Trip><Tracking /></Trip>} />
                <Route path="/squad" element={<Trip><Squad /></Trip>} />
                <Route path="/unlock" element={<Trip><Unlock /></Trip>} />
                <Route path="/wrapped" element={<Trip><Wrapped /></Trip>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/team" element={<TeamRoute />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </div>
        {showTabs && <TabBar />}
        <Checkout />
        <Sheet open={monthSheet} onClose={() => setMonthSheet(false)} title="Time machine">
          <MonthSlider />
          <p className="mt-3 text-[12px] text-muted">
            Same Riya, same spend. Slide to see her balance in both modes, month by month.
          </p>
        </Sheet>
      </OverlayContext.Provider>

      <div ref={setOverlay} className="pointer-events-none absolute inset-0 z-40" />
      <FlyLayer />
      <Toast />
    </div>
  );
}
