import { describe, expect, it } from 'vitest';
import { DEFAULTS as v, SQUAD_SIZE, TRIP_PIECES } from './assumptions';
import {
  balance,
  bluChips,
  bonuses,
  cacPerActive,
  dropCostToBrand,
  effectiveRate,
  growth,
  marginPerUser,
  monthlyEarn,
  monthsTo,
  orderEarn,
  paybackMonths,
  pendingToday,
  routedSpend,
  squadMonths,
  thresholds,
  tripCost,
  tripPercent,
} from './calc';
import { fmtINR, fmtINRExact, fmtMonths, fmtTripPct } from './format';

const kasol = TRIP_PIECES.kasol;
const cost = tripCost(kasol);

describe('headline numbers (must match the deck)', () => {
  it('routes ₹6,000 Today and ₹8,000 With TRIP', () => {
    expect(routedSpend(v, 'today')).toBeCloseTo(6000, 6);
    expect(routedSpend(v, 'trip')).toBeCloseTo(8000, 6);
  });

  it('earns at 4.0% Today and 6.0% With TRIP', () => {
    expect(effectiveRate(v, 'today')).toBeCloseTo(0.04, 10);
    expect(effectiveRate(v, 'trip')).toBeCloseTo(0.06, 10);
  });

  it('earns 240 Onpoints a month Today and 480 With TRIP', () => {
    expect(monthlyEarn(v, 'today')).toBeCloseTo(240, 6);
    expect(monthlyEarn(v, 'trip')).toBeCloseTo(480, 6);
  });

  it('gives 400 in one-time bonuses With TRIP and none Today', () => {
    expect(bonuses(v, 'today')).toBe(0);
    expect(bonuses(v, 'trip')).toBe(400);
  });

  it('reaches the Stay in 3.3 months', () => {
    expect(fmtMonths(monthsTo(v, 'trip', kasol.stay))).toBe('3.3');
  });

  it('reaches the whole trip in 16.7 months Today and 7.5 With TRIP', () => {
    expect(cost).toBe(4000);
    expect(fmtMonths(monthsTo(v, 'today', cost))).toBe('16.7');
    expect(fmtMonths(monthsTo(v, 'trip', cost))).toBe('7.5');
  });

  it('gets a squad of 4 to a ₹16,000 group trip in 7.5 months', () => {
    expect(cost * SQUAD_SIZE).toBe(16000);
    expect(fmtMonths(squadMonths(v, cost, SQUAD_SIZE))).toBe('7.5');
  });

  it('makes ₹120 margin per user Today and ₹160 With TRIP', () => {
    expect(marginPerUser(v, 'today')).toBeCloseTo(120, 6);
    expect(marginPerUser(v, 'trip')).toBeCloseTo(160, 6);
  });

  it('pays back an active user in 1.8 months at a CAC of ₹287.5', () => {
    expect(cacPerActive(v)).toBeCloseTo(287.5, 6);
    expect(fmtINRExact(cacPerActive(v))).toBe('₹287.5');
    expect(fmtMonths(paybackMonths(v))).toBe('1.8');
  });

  it('grows to 1,600 / 8,908 / 16,328 active earners at months 1 / 6 / 12', () => {
    const g = growth(v);
    expect(g).toHaveLength(12);
    expect(Math.round(g[0].actives)).toBe(1600);
    expect(Math.round(g[5].actives)).toBe(8908);
    expect(Math.round(g[11].actives)).toBe(16328);
    expect(fmtINR(g[11].monthlyMargin)).toBe('₹26.1 lakh');
  });
});

describe('figures shown on screens', () => {
  it('shows ₹1,840 and 46% at month 3', () => {
    const b = balance(v, 'trip', 3);
    expect(Math.round(b)).toBe(1840);
    expect(fmtTripPct(tripPercent(b, cost))).toBe('46%');
    expect(fmtMonths(monthsTo(v, 'trip', kasol.stay) - 3)).toBe('0.3');
  });

  it('shows ₹2,320 and 58% at month 4', () => {
    const b = balance(v, 'trip', 4);
    expect(Math.round(b)).toBe(2320);
    expect(fmtTripPct(tripPercent(b, cost))).toBe('58%');
  });

  it('earns +₹200 on a ₹2,000 fashion order inside a 2x Drop', () => {
    expect(orderEarn(v, 2000, 0.05, true)).toBeCloseTo(200, 6);
    expect(orderEarn(v, 2000, 0.05, false)).toBeCloseTo(100, 6);
  });

  it('converts 1,000 Onpoints to 800 BluChips', () => {
    expect(bluChips(v, 1000)).toBeCloseTo(800, 6);
  });

  it('shows 180 Onpoints pending in Today mode', () => {
    expect(pendingToday(v)).toBeCloseTo(180, 6);
  });

  it('charges ₹160 per user per month of Drop cost to the brand', () => {
    expect(dropCostToBrand(v)).toBeCloseTo(160, 6);
  });

  it('lands bonuses progressively when friends have not joined yet', () => {
    expect(balance(v, 'trip', 0, { welcome: false, friends: 0 })).toBe(0);
    expect(balance(v, 'trip', 0, { friends: 2 })).toBe(300);
  });

  it('takes 11.3 months without Drops', () => {
    expect(fmtMonths(monthsTo(v, 'trip', cost, { dropsOn: false }))).toBe('11.3');
  });

  it('unlocks pieces at cumulative thresholds', () => {
    expect(thresholds(kasol).map((t) => t.threshold)).toEqual([2000, 3400, 4000]);
  });
});

describe('growth model internals', () => {
  it('splits actives into campus and invite sources that add up', () => {
    for (const row of growth(v)) {
      expect(row.campusActives + row.inviteActives).toBeCloseTo(row.actives, 6);
    }
  });
});
