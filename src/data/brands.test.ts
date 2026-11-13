import { describe, expect, it } from 'vitest';
import { DEFAULTS } from '../engine/assumptions';
import { brands } from './brands';

describe('brand table', () => {
  const spend = brands.reduce((s, b) => s + b.spend, 0);
  const earn = brands.reduce((s, b) => s + b.spend * b.baseEarn, 0);

  it("adds up to Riya's routed spend", () => {
    expect(spend).toBe(DEFAULTS.routedSpendToday);
  });

  it('blends to the base earn rate', () => {
    expect(earn / spend).toBeCloseTo(DEFAULTS.baseRate, 10);
  });

  it('puts the dropsShare of spend inside a Drop', () => {
    const inDrop = brands.filter((b) => b.inDrop).reduce((s, b) => s + b.spend, 0);
    expect(inDrop / spend).toBeCloseTo(DEFAULTS.dropsShare, 10);
  });
});
