import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Suspense, lazy, useEffect, useState } from 'react';
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

const TeamRoute = lazy(() => import('../screens/team/TeamRoute'));

function Index() {
  const mode = useLab((s) => s.mode);
  return <Navigate to={mode === 'today' ? '/today' : '/home'} replace />;
}

/** With TRIP screens need a trip. Before onboarding, they lead to it. */
function Trip({ children }: { children: JSX.Element }) {
  const onboarded = useLab((s) => s.onboarded);
  return onboarded ? children : <Navigate to="/onboarding" replace />;
}

export function PhoneScreen() {
  const [overlay, setOverlay] = useState<HTMLElement | null>(null);
  const location = useLocation();
  const { pathname } = location;
  const month = useLab((s) => s.month);
  const lastNav = useLab((s) => s.lastNav);
  const setLastNav = useLab((s) => s.setLastNav);
  const setMode = useLab((s) => s.setMode);
  const monthSheet = useLab((s) => s.monthSheet);
  const setMonthSheet = useLab((s) => s.setMonthSheet);

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
      <header className="z-30 flex shrink-0 items-center justify-between gap-2 border-b border-ink/[0.06] bg-canvas px-3 pb-2 pt-[max(10px,env(safe-area-inset-top))]">
        <span className="w-[58px] font-display text-[13px] font-extrabold leading-none text-brand">
          Trip
          <br />
          Lab
        </span>
        <ModeSwitch />
        <button
          onClick={() => setMonthSheet(true)}
          aria-label={`M${fmtMonths(month)}: change simulated month`}
          className="flex w-[58px] items-center justify-end gap-1 whitespace-nowrap text-[12px] font-semibold text-ink"
        >
          <Clock size={16} />M{fmtMonths(month)}
        </button>
      </header>

      <OverlayContext.Provider value={overlay}>
        <div className="relative min-h-0 flex-1">
          <motion.div
            key={pathname}
            className="absolute inset-0"
            initial={flip ? { opacity: 0 } : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: flip ? 0.3 : 0.25, ease: 'easeOut' }}
          >
            <Suspense fallback={null}>
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
            </Suspense>
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
