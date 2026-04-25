import { reportToSnapshot, compareTrend, formatTrendComparison, TrendSnapshot } from './trend';
import { AuditReport } from './types';

const makeSnapshot = (overrides: Partial<TrendSnapshot> = {}): TrendSnapshot => ({
  timestamp: '2024-01-01T00:00:00.000Z',
  url: 'https://example.com',
  totalViolations: 10,
  criticalCount: 2,
  seriousCount: 3,
  moderateCount: 3,
  minorCount: 2,
  pagesAudited: 5,
  ...overrides,
});

const makeReport = (overrides: Partial<AuditReport> = {}): AuditReport => ({
  siteUrl: 'https://example.com',
  generatedAt: '2024-01-01T00:00:00.000Z',
  entries: [
    {
      url: 'https://example.com',
      violations: [
        {
          id: 'color-contrast',
          description: 'Ensure color contrast',
          impact: 'serious',
          wcag: [],
          nodes: [{ html: '<p>', failureSummary: 'Fix contrast', target: ['p'] }],
        },
        {
          id: 'image-alt',
          description: 'Images must have alt text',
          impact: 'critical',
          wcag: [],
          nodes: [{ html: '<img>', failureSummary: 'Add alt', target: ['img'] }],
        },
      ],
    },
  ],
  summary: { totalPages: 1, totalViolations: 2, violationsByImpact: { critical: 1, serious: 1 } },
  ...overrides,
});

describe('reportToSnapshot', () => {
  it('extracts snapshot fields from a report', () => {
    const snapshot = reportToSnapshot(makeReport());
    expect(snapshot.url).toBe('https://example.com');
    expect(snapshot.totalViolations).toBe(2);
    expect(snapshot.criticalCount).toBe(1);
    expect(snapshot.seriousCount).toBe(1);
    expect(snapshot.pagesAudited).toBe(1);
  });
});

describe('compareTrend', () => {
  it('detects regression when violations increase', () => {
    const prev = makeSnapshot({ totalViolations: 5 });
    const curr = makeSnapshot({ totalViolations: 10 });
    const result = compareTrend(prev, curr);
    expect(result.regressed).toBe(true);
    expect(result.improved).toBe(false);
    expect(result.delta.totalViolations).toBe(5);
  });

  it('detects improvement when violations decrease', () => {
    const prev = makeSnapshot({ totalViolations: 10 });
    const curr = makeSnapshot({ totalViolations: 4 });
    const result = compareTrend(prev, curr);
    expect(result.improved).toBe(true);
    expect(result.regressed).toBe(false);
    expect(result.delta.totalViolations).toBe(-6);
  });

  it('reports no change when violations are equal', () => {
    const snap = makeSnapshot();
    const result = compareTrend(snap, snap);
    expect(result.improved).toBe(false);
    expect(result.regressed).toBe(false);
  });
});

describe('formatTrendComparison', () => {
  it('includes improved status label', () => {
    const prev = makeSnapshot({ totalViolations: 10, criticalCount: 2 });
    const curr = makeSnapshot({ totalViolations: 7, criticalCount: 1 });
    const output = formatTrendComparison(compareTrend(prev, curr));
    expect(output).toContain('Improved');
    expect(output).toContain('-3');
    expect(output).toContain('-1');
  });

  it('includes regressed status label', () => {
    const prev = makeSnapshot({ totalViolations: 5 });
    const curr = makeSnapshot({ totalViolations: 8 });
    const output = formatTrendComparison(compareTrend(prev, curr));
    expect(output).toContain('Regressed');
    expect(output).toContain('+3');
  });
});
