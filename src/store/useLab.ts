import { useMemo } from 'react';
import { create } from 'zustand';
import { DEFAULT_DROPS, brandById } from '../data/brands';
import { destinationById, PIECE_LABEL } from '../data/destinations';
import { defaultSquad, type SquadMember } from '../data/squad';
import { ASSUMPTIONS, DEFAULTS, type AssumptionKey, type DestinationId, type Values } from '../engine/assumptions';
import * as calc from '../engine/calc';
import type { Mode } from '../engine/calc';

export type PanelTab = 'story' | 'calculator' | 'growth' | 'assumptions';

export interface Order {
  id: string;
  brandId: string;
  amount: number;
  inDrop: boolean;
  createdAt: number;
}

/** Tracking stages advance every 1.5s after an order is placed (illustrative). */
export const STAGE_MS = 1500;
export const STAGES = ['Clicked', 'Order placed', 'Tracked (pending)', 'Confirmed'] as const;
export const orderStage = (o: Order, now: number) =>
  Math.max(0, Math.min(STAGES.length - 1, Math.floor((now - o.createdAt) / STAGE_MS)));

const seedOrders = (): Order[] => [
  { id: 'seed-nykaa', brandId: 'nykaa', amount: 1000, inDrop: true, createdAt: 0 },
  { id: 'seed-swiggy', brandId: 'swiggy', amount: 400, inDrop: false, createdAt: 0 },
];

const STORAGE_KEY = 'onpoint-trip-lab';
const params = new URLSearchParams(
  typeof window === 'undefined' ? '' : window.location.search || window.location.hash.split('?')[1] || '',
);
export const IS_DEMO = params.get('demo') === '1';
export const LAYOUT_PARAM = params.get('layout') as 'portrait' | 'landscape' | null;

const loadSaved = (): { mode?: Mode; month?: number } => {
  if (IS_DEMO) return {};
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      mode: raw.mode === 'trip' || raw.mode === 'today' ? raw.mode : undefined,
      month: typeof raw.month === 'number' && raw.month >= 0 && raw.month <= 12 ? raw.month : undefined,
    };
  } catch {
    return {};
  }
};

const save = (mode: Mode, month: number) => {
  if (IS_DEMO) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, month }));
  } catch {
    /* storage unavailable: fine */
  }
};

export interface LabState {
  mode: Mode;
  month: number;
  destinationId: DestinationId;
  tripType: 'solo' | 'squad';
  onboarded: boolean;
  onboardingStep: number;
  welcomeLanded: boolean;
  squad: SquadMember[];
  activeDrops: string[];
  trackedOrders: Order[];
  assumptionOverrides: Partial<Values>;
  demoStep: number;
  captionsHidden: boolean;
  panelTab: PanelTab;
  highlight: string | null;
  toast: { id: number; text: string } | null;
  monthSheet: boolean;
  /** Brand whose checkout sheet is open. */
  checkoutBrandId: string | null;
  /** Points currently flying from a brand tile into the goal bar. */
  fly: { key: number; brandId: string; points: number } | null;
  /** How the last navigation happened, so the screen transition can match. */
  lastNav: 'nav' | 'flip';

  setMode: (mode: Mode) => void;
  setMonth: (month: number) => void;
  setDestination: (id: DestinationId) => void;
  setTripType: (t: 'solo' | 'squad') => void;
  setOnboardingStep: (n: number) => void;
  finishOnboarding: () => void;
  joinFriend: (id: string) => void;
  addOrder: (brandId: string, amount: number) => Order;
  restartOrder: (id: string) => void;
  setAssumption: (key: AssumptionKey, value: number) => void;
  resetAssumptions: () => void;
  setPanelTab: (t: PanelTab) => void;
  setHighlight: (h: string | null) => void;
  showToast: (text: string) => void;
  clearToast: () => void;
  setMonthSheet: (open: boolean) => void;
  openCheckout: (brandId: string | null) => void;
  setFly: (fly: LabState['fly']) => void;
  setLastNav: (n: 'nav' | 'flip') => void;
  setDemoStep: (n: number) => void;
  toggleCaptions: () => void;
  /** Reset the story. `fresh` starts before onboarding with Aarav still to join. */
  resetStory: (o?: { fresh?: boolean; onboarded?: boolean; aaravJoined?: boolean }) => void;
}

const saved = loadSaved();
let toastId = 0;
let orderId = 0;

export const useLab = create<LabState>((set, get) => ({
  mode: saved.mode ?? 'today',
  month: saved.month ?? 3,
  destinationId: 'kasol',
  tripType: 'squad',
  onboarded: true,
  onboardingStep: 0,
  welcomeLanded: true,
  squad: defaultSquad(true),
  activeDrops: DEFAULT_DROPS,
  trackedOrders: seedOrders(),
  assumptionOverrides: {},
  demoStep: 0,
  captionsHidden: false,
  panelTab: 'story',
  highlight: null,
  toast: null,
  monthSheet: false,
  checkoutBrandId: null,
  fly: null,
  lastNav: 'nav',

  setMode: (mode) => {
    if (get().mode === mode) return;
    set({ mode });
    save(mode, get().month);
  },
  setMonth: (month) => {
    const m = Math.max(0, Math.min(12, month));
    set({ month: m });
    save(get().mode, m);
  },
  setDestination: (destinationId) => set({ destinationId }),
  setTripType: (tripType) => set({ tripType }),
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
  finishOnboarding: () => set({ onboarded: true, welcomeLanded: true, onboardingStep: 0 }),
  joinFriend: (id) => set({ squad: get().squad.map((m) => (m.id === id ? { ...m, joined: true } : m)) }),
  addOrder: (brandId, amount) => {
    const order: Order = {
      id: `order-${++orderId}`,
      brandId,
      amount,
      inDrop: get().activeDrops.includes(brandId),
      createdAt: Date.now(),
    };
    set({ trackedOrders: [order, ...get().trackedOrders] });
    return order;
  },
  restartOrder: (id) =>
    set({ trackedOrders: get().trackedOrders.map((o) => (o.id === id ? { ...o, createdAt: Date.now() } : o)) }),
  setAssumption: (key, value) => {
    const a = ASSUMPTIONS[key] as { value: number; step?: number };
    const next = { ...get().assumptionOverrides };
    // Snap back to the deck value when the input lands on it.
    if (Math.abs(value - a.value) <= (a.step ?? 0) / 2 + 1e-9) delete next[key];
    else next[key] = value;
    set({ assumptionOverrides: next });
  },
  resetAssumptions: () => set({ assumptionOverrides: {}, destinationId: 'kasol' }),
  setPanelTab: (panelTab) => set({ panelTab }),
  setHighlight: (highlight) => set({ highlight }),
  showToast: (text) => set({ toast: { id: ++toastId, text } }),
  clearToast: () => set({ toast: null }),
  setMonthSheet: (monthSheet) => set({ monthSheet }),
  openCheckout: (checkoutBrandId) => set({ checkoutBrandId }),
  setFly: (fly) => set({ fly }),
  setLastNav: (lastNav) => set({ lastNav }),
  setDemoStep: (demoStep) => set({ demoStep }),
  toggleCaptions: () => set({ captionsHidden: !get().captionsHidden }),
  resetStory: (o = {}) => {
    const onboarded = o.onboarded ?? !o.fresh;
    set({
      destinationId: 'kasol',
      tripType: 'squad',
      onboarded,
      onboardingStep: 0,
      welcomeLanded: onboarded,
      squad: defaultSquad(o.aaravJoined ?? !o.fresh),
      activeDrops: DEFAULT_DROPS,
      trackedOrders: seedOrders(),
      highlight: null,
      toast: null,
      monthSheet: false,
      checkoutBrandId: null,
      fly: null,
    });
  },
}));

// ---- Derived numbers: every figure on screen comes through here -------------

export const valuesOf = (overrides: Partial<Values>): Values => ({ ...DEFAULTS, ...overrides });

export function derive(s: LabState) {
  const v = valuesOf(s.assumptionOverrides);
  const dest = destinationById(s.destinationId);
  const cost = calc.tripCost(dest.pieces);

  // Live state: bonuses count only once they have actually landed in the story.
  const friends = s.squad.filter((m) => !m.isYou);
  const joinedFriends = friends.filter((m) => m.joined).length;
  const liveFriends = joinedFriends === friends.length ? v.friendsJoined : Math.min(joinedFriends, v.friendsJoined);
  const live: calc.EarnOpts = { friends: liveFriends, welcome: s.welcomeLanded };

  const tripBalance = calc.balance(v, 'trip', s.month, live);
  const todayBalance = calc.balance(v, 'today', s.month);
  const percent = calc.tripPercent(tripBalance, cost);

  const milestones = calc.thresholds(dest.pieces).map((t) => {
    const at = calc.monthsTo(v, 'trip', t.threshold, live);
    return {
      ...t,
      label: PIECE_LABEL[t.key],
      note: dest.pieceNotes[t.key],
      monthsAt: at,
      monthsToGo: Math.max(0, at - s.month),
      unlocked: calc.isUnlocked(tripBalance, t.threshold),
    };
  });
  const next = milestones.find((m) => !m.unlocked) ?? null;

  const title = s.tripType === 'squad' ? `${dest.name} with the gang` : `${dest.name}, solo`;

  return {
    v,
    dest,
    cost,
    title,
    month: s.month,
    live,
    today: {
      spend: calc.routedSpend(v, 'today'),
      rate: calc.effectiveRate(v, 'today'),
      monthly: calc.monthlyEarn(v, 'today'),
      balance: todayBalance,
      pending: calc.pendingToday(v),
      monthsTrip: calc.monthsTo(v, 'today', cost),
      monthsStay: calc.monthsTo(v, 'today', dest.pieces.stay),
      margin: calc.marginPerUser(v, 'today'),
    },
    trip: {
      spend: calc.routedSpend(v, 'trip'),
      rate: calc.effectiveRate(v, 'trip'),
      monthly: calc.monthlyEarn(v, 'trip'),
      bonusesPlan: calc.bonuses(v, 'trip'),
      bonusesLive: calc.bonuses(v, 'trip', live),
      balance: tripBalance,
      percent,
      // Plan figures assume the full squad has joined (the deck numbers).
      monthsStay: calc.monthsTo(v, 'trip', dest.pieces.stay),
      monthsTrip: calc.monthsTo(v, 'trip', cost),
      monthsTripNoDrops: calc.monthsTo(v, 'trip', cost, { dropsOn: false }),
      margin: calc.marginPerUser(v, 'trip'),
    },
    milestones,
    next,
    earnFor: (brandId: string, amount: number, inDrop: boolean) =>
      calc.orderEarn(v, amount, brandById(brandId).baseEarn, inDrop),
  };
}

export type Derived = ReturnType<typeof derive>;

export function useEngine(): Derived {
  const s = useLab();
  return useMemo(
    () => derive(s),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.month, s.destinationId, s.tripType, s.squad, s.welcomeLanded, s.assumptionOverrides],
  );
}
