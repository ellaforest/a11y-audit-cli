import {
  getImpactScore,
  meetsMinImpact,
  sortByImpact,
  impactLabel,
  IMPACT_SCORE,
} from './severity';

describe('getImpactScore', () => {
  it('returns correct scores for known levels', () => {
    expect(getImpactScore('critical')).toBe(4);
    expect(getImpactScore('serious')).toBe(3);
    expect(getImpactScore('moderate')).toBe(2);
    expect(getImpactScore('minor')).toBe(1);
  });

  it('returns 0 for undefined', () => {
    expect(getImpactScore(undefined)).toBe(0);
  });

  it('returns 0 for unknown string', () => {
    expect(getImpactScore('unknown-level')).toBe(0);
  });
});

describe('meetsMinImpact', () => {
  it('returns true when impact equals minimum', () => {
    expect(meetsMinImpact('serious', 'serious')).toBe(true);
  });

  it('returns true when impact exceeds minimum', () => {
    expect(meetsMinImpact('critical', 'moderate')).toBe(true);
  });

  it('returns false when impact is below minimum', () => {
    expect(meetsMinImpact('minor', 'serious')).toBe(false);
  });

  it('returns false for undefined impact', () => {
    expect(meetsMinImpact(undefined, 'minor')).toBe(false);
  });
});

describe('sortByImpact', () => {
  it('sorts items by impact descending', () => {
    const items = [
      { id: 'a', impact: 'minor' },
      { id: 'b', impact: 'critical' },
      { id: 'c', impact: 'moderate' },
    ];
    const sorted = sortByImpact(items, (i) => i.impact);
    expect(sorted.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the original array', () => {
    const items = [{ impact: 'minor' }, { impact: 'critical' }];
    const original = [...items];
    sortByImpact(items, (i) => i.impact);
    expect(items).toEqual(original);
  });
});

describe('impactLabel', () => {
  it('returns labelled strings with emoji', () => {
    expect(impactLabel('critical')).toBe('🔴 critical');
    expect(impactLabel('serious')).toBe('🟠 serious');
    expect(impactLabel('moderate')).toBe('🟡 moderate');
    expect(impactLabel('minor')).toBe('🔵 minor');
  });

  it('returns unknown label for undefined', () => {
    expect(impactLabel(undefined)).toBe('⚪ unknown');
  });
});

describe('IMPACT_SCORE map', () => {
  it('has all four levels defined', () => {
    expect(Object.keys(IMPACT_SCORE)).toHaveLength(4);
  });
});
