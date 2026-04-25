import { groupEntries, formatGroupSummary, GroupedEntries } from './grouping';
import { ReportEntry } from './types';

function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    url: 'https://example.com',
    ruleId: 'color-contrast',
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    wcag: [],
    nodes: [],
    ...overrides,
  };
}

describe('groupEntries', () => {
  it('groups entries by rule', () => {
    const entries = [
      makeEntry({ ruleId: 'color-contrast' }),
      makeEntry({ ruleId: 'color-contrast' }),
      makeEntry({ ruleId: 'image-alt' }),
    ];
    const groups = groupEntries(entries, 'rule');
    expect(groups).toHaveLength(2);
    const ccGroup = groups.find((g) => g.key === 'color-contrast');
    expect(ccGroup?.count).toBe(2);
  });

  it('groups entries by url', () => {
    const entries = [
      makeEntry({ url: 'https://example.com/a' }),
      makeEntry({ url: 'https://example.com/b' }),
      makeEntry({ url: 'https://example.com/a' }),
    ];
    const groups = groupEntries(entries, 'url');
    expect(groups).toHaveLength(2);
    const aGroup = groups.find((g) => g.key === 'https://example.com/a');
    expect(aGroup?.count).toBe(2);
  });

  it('groups entries by impact', () => {
    const entries = [
      makeEntry({ impact: 'critical' }),
      makeEntry({ impact: 'serious' }),
      makeEntry({ impact: 'critical' }),
    ];
    const groups = groupEntries(entries, 'impact');
    expect(groups).toHaveLength(2);
    const critGroup = groups.find((g) => g.key === 'critical');
    expect(critGroup?.count).toBe(2);
  });

  it('handles unknown impact as "unknown"', () => {
    const entries = [makeEntry({ impact: undefined })];
    const groups = groupEntries(entries, 'impact');
    expect(groups[0].key).toBe('unknown');
  });

  it('sorts groups by count descending', () => {
    const entries = [
      makeEntry({ ruleId: 'a' }),
      makeEntry({ ruleId: 'b' }),
      makeEntry({ ruleId: 'b' }),
      makeEntry({ ruleId: 'b' }),
      makeEntry({ ruleId: 'a' }),
    ];
    const groups = groupEntries(entries, 'rule');
    expect(groups[0].key).toBe('b');
    expect(groups[1].key).toBe('a');
  });

  it('returns empty array for empty input', () => {
    expect(groupEntries([], 'rule')).toEqual([]);
  });
});

describe('formatGroupSummary', () => {
  it('formats group summary lines', () => {
    const groups: GroupedEntries[] = [
      { key: 'color-contrast', entries: [], count: 3 },
      { key: 'image-alt', entries: [], count: 1 },
    ];
    const result = formatGroupSummary(groups);
    expect(result).toContain('color-contrast (3 violations)');
    expect(result).toContain('image-alt (1 violation)');
  });

  it('returns empty string for empty groups', () => {
    expect(formatGroupSummary([])).toBe('');
  });
});
