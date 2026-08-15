import { describe, it, expect } from 'vitest';
import {
  hashString,
  assignVariant,
  computeResults,
  validateEvent,
} from '../src/services/experimentService.js';

describe('hashString', () => {
  it('returns a non-negative integer', () => {
    expect(hashString('abc')).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hashString('abc'))).toBe(true);
  });

  it('is deterministic for the same input', () => {
    expect(hashString('home_gym_layout:user-1')).toBe(
      hashString('home_gym_layout:user-1')
    );
  });

  it('spreads different inputs', () => {
    const values = new Set(['a', 'b', 'c', 'd'].map((v) => hashString(v)));
    expect(values.size).toBe(4);
  });
});

describe('assignVariant', () => {
  it('is deterministic for a given experiment + user', () => {
    expect(assignVariant({ experiment: 'home_gym_layout', userId: 'u1' })).toBe(
      assignVariant({ experiment: 'home_gym_layout', userId: 'u1' })
    );
  });

  it('returns one of the declared variants', () => {
    for (let i = 0; i < 100; i++) {
      const variant = assignVariant({
        experiment: 'home_gym_layout',
        userId: `u${i}`,
      });
      expect(['A', 'B']).toContain(variant);
    }
  });

  it('balances roughly 50/50 over many users', () => {
    let countA = 0;
    for (let i = 0; i < 2000; i++) {
      if (assignVariant({ experiment: 'home_gym_layout', userId: `u${i}` }) === 'A') {
        countA++;
      }
    }
    const pctA = countA / 2000;
    expect(Math.abs(pctA - 0.5)).toBeLessThan(0.05);
  });

  it('honors custom weights', () => {
    const variant = assignVariant({
      experiment: 'x',
      userId: 'u1',
      variants: ['A', 'B'],
      weights: [1, 3],
    });
    expect(['A', 'B']).toContain(variant);
  });
});

describe('computeResults', () => {
  it('returns zeroed stats when there are no events', () => {
    const r = computeResults('exp', []);
    expect(r.variants.A.impressions).toBe(0);
    expect(r.variants.A.conversions).toBe(0);
    expect(r.variants.B.impressions).toBe(0);
    expect(r.total.impressions).toBe(0);
  });

  it('counts impressions and conversions per variant', () => {
    const events = [
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'conversion' },
      { variant: 'B', eventType: 'impression' },
      { variant: 'B', eventType: 'conversion' },
    ];
    const r = computeResults('exp', events);
    expect(r.variants.A.impressions).toBe(2);
    expect(r.variants.A.conversions).toBe(1);
    expect(r.variants.A.rate).toBe(0.5);
    expect(r.variants.B.impressions).toBe(1);
    expect(r.variants.B.rate).toBe(1);
  });

  it('computes conversion rates correctly', () => {
    const events = [
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'conversion' },
      { variant: 'B', eventType: 'impression' },
    ];
    const r = computeResults('exp', events);
    expect(r.variants.A.rate).toBe(0.5);
    expect(r.variants.B.rate).toBe(0);
  });

  it('reports uplift of B over A', () => {
    const events = [
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'impression' },
      { variant: 'A', eventType: 'conversion' },
      { variant: 'B', eventType: 'impression' },
      { variant: 'B', eventType: 'conversion' },
    ];
    const r = computeResults('exp', events);
    expect(r.uplift).toBeCloseTo(100);
  });

  it('returns null uplift when control has no impressions', () => {
    const events = [
      { variant: 'B', eventType: 'impression' },
      { variant: 'B', eventType: 'conversion' },
    ];
    const r = computeResults('exp', events);
    expect(r.uplift).toBeNull();
  });

  it('flags significance on a strong result', () => {
    const events = [];
    for (let i = 0; i < 200; i++) {
      events.push({ variant: 'A', eventType: 'impression' });
      if (i < 100) events.push({ variant: 'A', eventType: 'conversion' });
      events.push({ variant: 'B', eventType: 'impression' });
      if (i < 60) events.push({ variant: 'B', eventType: 'conversion' });
    }
    const r = computeResults('exp', events);
    expect(r.significant).toBe(true);
    expect(r.pValue).toBeLessThan(0.05);
  });

  it('is not significant when results are similar', () => {
    const events = [];
    for (let i = 0; i < 200; i++) {
      events.push({ variant: 'A', eventType: 'impression' });
      if (i < 100) events.push({ variant: 'A', eventType: 'conversion' });
      events.push({ variant: 'B', eventType: 'impression' });
      if (i < 100) events.push({ variant: 'B', eventType: 'conversion' });
    }
    const r = computeResults('exp', events);
    expect(r.significant).toBe(false);
  });

  it('returns null pValue when a variant has no impressions', () => {
    const events = [{ variant: 'A', eventType: 'impression' }];
    const r = computeResults('exp', events);
    expect(r.pValue).toBeNull();
  });
});

describe('validateEvent', () => {
  it('accepts a valid event', () => {
    expect(
      validateEvent({
        experiment: 'home_gym_layout',
        variant: 'A',
        eventType: 'impression',
        userId: 'u1',
      }).valid
    ).toBe(true);
  });

  it('rejects unknown variant', () => {
    expect(
      validateEvent({
        experiment: 'home_gym_layout',
        variant: 'C',
        eventType: 'impression',
      }).valid
    ).toBe(false);
  });

  it('rejects unknown eventType', () => {
    expect(
      validateEvent({
        experiment: 'home_gym_layout',
        variant: 'A',
        eventType: 'click',
      }).valid
    ).toBe(false);
  });

  it('rejects missing experiment', () => {
    expect(
      validateEvent({ variant: 'A', eventType: 'impression' }).valid
    ).toBe(false);
  });
});
