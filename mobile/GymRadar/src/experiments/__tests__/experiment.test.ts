import {
  hashString,
  assignVariant,
  buildEventPayload,
} from '../experiment';

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
});

describe('assignVariant', () => {
  it('is deterministic for a given experiment + user', () => {
    expect(assignVariant('home_gym_layout', 'u1')).toBe(
      assignVariant('home_gym_layout', 'u1')
    );
  });

  it('only returns the declared variants', () => {
    for (let i = 0; i < 100; i++) {
      const variant = assignVariant('home_gym_layout', `u${i}`);
      expect(['A', 'B']).toContain(variant);
    }
  });

  it('balances roughly 50/50 over many users', () => {
    let countA = 0;
    const users = 2000;
    for (let i = 0; i < users; i++) {
      if (assignVariant('home_gym_layout', `u${i}`) === 'A') countA++;
    }
    expect(Math.abs(countA / users - 0.5)).toBeLessThan(0.05);
  });
});

describe('buildEventPayload', () => {
  it('builds a valid event payload', () => {
    const payload = buildEventPayload('home_gym_layout', 'A', 'impression', 'user-1');
    expect(payload).toEqual({
      experiment: 'home_gym_layout',
      variant: 'A',
      eventType: 'impression',
      userId: 'user-1',
    });
  });

  it('builds a conversion payload', () => {
    const payload = buildEventPayload('home_gym_layout', 'B', 'conversion', 'user-2');
    expect(payload.eventType).toBe('conversion');
    expect(payload.variant).toBe('B');
  });
});
