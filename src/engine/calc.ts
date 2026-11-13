// All maths for the prototype. Pure functions over the assumption values.
// Never round in here: rounding happens only in format.ts, for display.

import type { TripPieces, Values } from './assumptions';

export type Mode = 'today' | 'trip';

export interface EarnOpts {
  /** Friends who have actually joined. Defaults to the friendsJoined assumption. */
  friends?: number;
  /** Whether the welcome bonus has landed. Defaults to true. */
  welcome?: boolean;
  /** Whether Drops are live. Defaults to true. */
  dropsOn?: boolean;
}

export const routedSpend = (v: Values, mode: Mode) =>
  mode === 'today' ? v.routedSpendToday : v.routedSpendToday * (1 + v.spendLift);

export const effectiveRate = (v: Values, mode: Mode, dropsOn = true) =>
  mode === 'today' || !dropsOn
    ? v.baseRate
    : v.baseRate * (1 + v.dropsShare * (v.dropsMultiplier - 1));

export const monthlyEarn = (v: Values, mode: Mode, dropsOn = true) =>
  routedSpend(v, mode) * effectiveRate(v, mode, dropsOn);

export const bonuses = (v: Values, mode: Mode, o: EarnOpts = {}) =>
  mode === 'today'
    ? 0
    : (o.welcome === false ? 0 : v.welcomeBonus) + v.referralBonus * (o.friends ?? v.friendsJoined);

export const balance = (v: Values, mode: Mode, m: number, o: EarnOpts = {}) =>
  bonuses(v, mode, o) + monthlyEarn(v, mode, o.dropsOn ?? true) * m;

export const monthsTo = (v: Values, mode: Mode, cost: number, o: EarnOpts = {}) => {
  const earn = monthlyEarn(v, mode, o.dropsOn ?? true);
  if (earn <= 0) return Infinity;
  return Math.max(0, (cost - bonuses(v, mode, o)) / earn);
};

export const tripPercent = (bal: number, cost: number) =>
  cost <= 0 ? 100 : Math.min(100, (bal / cost) * 100);

export const bluChips = (v: Values, pts: number) => pts * v.indigoRatio;

export const rupeeValue = (v: Values, pts: number) => pts * v.pointValueINR;

/** Onpoints from one order at a brand. Drops only apply With TRIP. */
export const orderEarn = (v: Values, amount: number, brandBaseEarn: number, inDrop: boolean) =>
  amount * brandBaseEarn * (inDrop ? v.dropsMultiplier : 1);

export const pendingToday = (v: Values) => monthlyEarn(v, 'today') * v.pendingShare;

// ---- Trip pieces ---------------------------------------------------------

export const tripCost = (p: TripPieces) => p.stay + p.travel + p.experience;

export type PieceKey = keyof TripPieces;
export const PIECE_ORDER: PieceKey[] = ['stay', 'travel', 'experience'];

/** Cumulative balance needed to unlock each piece, in order. */
export const thresholds = (p: TripPieces) => {
  let run = 0;
  return PIECE_ORDER.map((key) => {
    run += p[key];
    return { key, cost: p[key], threshold: run };
  });
};

const EPS = 1e-6;
export const isUnlocked = (bal: number, threshold: number) => bal + EPS >= threshold;

// ---- Squad ---------------------------------------------------------------

/** Months for a squad to fund a group trip when every member earns like the persona. */
export const squadMonths = (v: Values, costPerPerson: number, size: number) => {
  const earn = monthlyEarn(v, 'trip') * size;
  if (earn <= 0) return Infinity;
  return Math.max(0, (costPerPerson * size - bonuses(v, 'trip') * size) / earn);
};

// ---- Team view: unit economics --------------------------------------------

export const marginPerUser = (v: Values, mode: Mode) =>
  routedSpend(v, mode) * (v.affiliateCommission - v.baseRate);

/** ₹ per user per month, paid by the brand, not by Onpoint. */
export const dropCostToBrand = (v: Values) =>
  routedSpend(v, 'trip') * v.dropsShare * v.baseRate * (v.dropsMultiplier - 1);

export const cacPerActive = (v: Values) =>
  v.ambassadorStipend / v.signupsPerAmbassador / v.activationRate + v.welcomeBonus * v.pointValueINR;

export const paybackMonths = (v: Values) => cacPerActive(v) / marginPerUser(v, 'trip');

// ---- Team view: 12-month growth --------------------------------------------

export interface GrowthRow {
  t: number;
  newFromCampus: number;
  newFromInvites: number;
  /** Active earners originally acquired through campus ambassadors. */
  campusActives: number;
  /** Active earners originally acquired through invites. */
  inviteActives: number;
  actives: number;
  monthlyMargin: number;
}

export const growth = (v: Values, months = 12): GrowthRow[] => {
  const rows: GrowthRow[] = [];
  const keep = 1 - v.monthlyChurn;
  const margin = marginPerUser(v, 'trip');
  let campus = 0;
  let invite = 0;
  for (let t = 1; t <= months; t++) {
    const prev = campus + invite;
    const newFromCampus = v.ambassadors * v.signupsPerAmbassador * v.activationRate;
    const newFromInvites = prev * v.inviteRate;
    campus = campus * keep + newFromCampus;
    invite = invite * keep + newFromInvites;
    const actives = campus + invite;
    rows.push({
      t,
      newFromCampus,
      newFromInvites,
      campusActives: campus,
      inviteActives: invite,
      actives,
      monthlyMargin: actives * margin,
    });
  }
  return rows;
};
