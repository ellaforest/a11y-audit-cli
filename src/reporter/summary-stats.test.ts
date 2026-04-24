import { computeSummaryStats } from './summary-stats';
import type { ReportEntry } from './types';

function makeEntry(url: string, violations: Array<{ id: string; impact?: string }>): ReportEntry {
  return {
    url,
    violations: violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: '',
      help: '',
      helpUrl: '',
      wcag: [],
      nodes: [],
    })),
    timestamp: new Date().toISOString(),
  };
}

describe('computeSummaryStats', () => {
  it('returns zeroed stats for empty entries', () => {
    const stats = computeSummaryStats([]);
    expect(stats.totalPages).toBe(0);
    expect(stats.totalViolations).toBe(0);
    expect(stats.pagesWithViolations).toBe(0);
    expect(stats.averageViolationsPerPage).toBe(0);
    expect(stats.topViolations).toHaveLength(0);
  });

  it('counts total pages and violations correctly', () => {
    const entries = [
      makeEntry('http://a.com', [{ id: 'rule-1', impact: 'critical' }]),
      makeEntry('http://b.com', [{ id: 'rule-2', impact: 'minor' }, { id: 'rule-1', impact: 'critical' }]),
      makeEntry('http://c.com', []),
    ];
    const stats = computeSummaryStats(entries);
    expect(stats.totalPages).toBe(3);
    expect(stats.totalViolations).toBe(3);
    expect(stats.pagesWithViolations).toBe(2);
  });

  it('counts violations by impact level', () => {
    const entries = [
      makeEntry('http://a.com', [
        { id: 'r1', impact: 'critical' },
        { id: 'r2', impact: 'serious' },
        { id: 'r3', impact: 'moderate' },
        { id: 'r4', impact: 'minor' },
        { id: 'r5', impact: 'critical' },
      ]),
    ];
    const stats = computeSummaryStats(entries);
    expect(stats.violationsByImpact.critical).toBe(2);
    expect(stats.violationsByImpact.serious).toBe(1);
    expect(stats.violationsByImpact.moderate).toBe(1);
    expect(stats.violationsByImpact.minor).toBe(1);
  });

  it('computes top violations sorted by count then impact', () => {
    const entries = [
      makeEntry('http://a.com', [
        { id: 'common', impact: 'serious' },
        { id: 'common', impact: 'serious' },
        { id: 'rare', impact: 'critical' },
      ]),
    ];
    const stats = computeSummaryStats(entries);
    expect(stats.topViolations[0].ruleId).toBe('common');
    expect(stats.topViolations[0].count).toBe(2);
    expect(stats.topViolations[1].ruleId).toBe('rare');
  });

  it('calculates average violations per page', () => {
    const entries = [
      makeEntry('http://a.com', [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }]),
      makeEntry('http://b.com', [{ id: 'r1' }]),
    ];
    const stats = computeSummaryStats(entries);
    expect(stats.averageViolationsPerPage).toBe(2);
  });

  it('limits topViolations to 10 entries', () => {
    const violations = Array.from({ length: 15 }, (_, i) => ({ id: `rule-${i}` }));
    const entries = [makeEntry('http://a.com', violations)];
    const stats = computeSummaryStats(entries);
    expect(stats.topViolations.length).toBeLessThanOrEqual(10);
  });
});
