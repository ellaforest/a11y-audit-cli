import { runGroupCommand, parseGroupKey } from './group-command';
import { Report } from '../reporter/types';
import { ReportEntry } from '../reporter/types';

function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    url: 'https://example.com',
    ruleId: 'color-contrast',
    impact: 'serious',
    description: 'Color contrast issue',
    wcag: [],
    nodes: [],
    ...overrides,
  };
}

function makeReport(entries: ReportEntry[]): Report {
  return {
    generatedAt: new Date().toISOString(),
    entries,
    summary: { total: entries.length, byImpact: {}, byRule: {} },
  };
}

describe('runGroupCommand', () => {
  it('returns a message when no violations exist', () => {
    const report = makeReport([]);
    const result = runGroupCommand(report, { by: 'rule' });
    expect(result).toBe('No violations found to group.');
  });

  it('groups by rule and includes header', () => {
    const entries = [
      makeEntry({ ruleId: 'color-contrast' }),
      makeEntry({ ruleId: 'color-contrast' }),
      makeEntry({ ruleId: 'image-alt' }),
    ];
    const result = runGroupCommand(makeReport(entries), { by: 'rule' });
    expect(result).toContain('Grouped by: rule');
    expect(result).toContain('color-contrast (2 violations)');
    expect(result).toContain('image-alt (1 violation)');
  });

  it('groups by impact', () => {
    const entries = [
      makeEntry({ impact: 'critical' }),
      makeEntry({ impact: 'serious' }),
    ];
    const result = runGroupCommand(makeReport(entries), { by: 'impact' });
    expect(result).toContain('Grouped by: impact');
    expect(result).toContain('critical');
    expect(result).toContain('serious');
  });

  it('limits results with topN', () => {
    const entries = [
      makeEntry({ ruleId: 'a' }),
      makeEntry({ ruleId: 'b' }),
      makeEntry({ ruleId: 'c' }),
    ];
    const result = runGroupCommand(makeReport(entries), { by: 'rule', topN: 2 });
    expect(result).toContain('2 groups');
  });

  it('shows singular group label', () => {
    const entries = [makeEntry({ ruleId: 'only-rule' })];
    const result = runGroupCommand(makeReport(entries), { by: 'rule' });
    expect(result).toContain('1 group)');
  });
});

describe('parseGroupKey', () => {
  it('accepts valid keys', () => {
    expect(parseGroupKey('rule')).toBe('rule');
    expect(parseGroupKey('url')).toBe('url');
    expect(parseGroupKey('impact')).toBe('impact');
  });

  it('throws on invalid key', () => {
    expect(() => parseGroupKey('severity')).toThrow(
      'Invalid --group-by value: "severity"'
    );
  });
});
