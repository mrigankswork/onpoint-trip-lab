import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Mode } from './engine/calc';
import { brandById } from './data/brands';
import { orderEarn } from './engine/calc';
import { orderStage, STAGES, useLab, valuesOf } from './store/useLab';

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** Re-renders on an interval; returns the current time. */
export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// Each screen's counterpart in the other mode. Anything else lands on that mode's home.
const PAIRS: Record<string, string> = {
  '/today': '/home',
  '/today/redeem': '/goal',
  '/home': '/today',
  '/goal': '/today/redeem',
};
const NEUTRAL = ['/profile', '/team'];
export const TRIP_PATHS = ['/onboarding', '/home', '/goal', '/shop', '/tracking', '/squad', '/unlock', '/wrapped'];

export function useFlip() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (to?: Mode) => {
    const s = useLab.getState();
    const target: Mode = to ?? (s.mode === 'today' ? 'trip' : 'today');
    if (target === s.mode) return;
    s.setLastNav('flip');
    s.setMode(target);
    if (!NEUTRAL.includes(pathname)) navigate(PAIRS[pathname] ?? (target === 'today' ? '/today' : '/home'));
    s.showToast(target === 'trip' ? 'Same spend. Now you can see the trip.' : 'Same Riya. This is the app today.');
  };
}

/** Onpoints from tracked orders that are not confirmed yet. Shown striped, never added to the balance. */
export function usePendingPoints() {
  const orders = useLab((s) => s.trackedOrders);
  const overrides = useLab((s) => s.assumptionOverrides);
  const now = useNow(500);
  const v = valuesOf(overrides);
  return orders
    .filter((o) => orderStage(o, now) < STAGES.length - 1)
    .reduce((sum, o) => sum + orderEarn(v, o.amount, brandById(o.brandId).baseEarn, o.inDrop), 0);
}
