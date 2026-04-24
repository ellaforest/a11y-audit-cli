import { filterEntries, filterReport, sortEntriesByImpact } from './filter';
import { AuditReport, ReportEntry } from './types';

const makeEntry = (url: string, violations: any[]): ReportEntry => ({
  url,
  violations,
});

const mockViolations = [
  { id: 'color-contrast', impact: 'serious', description: 'Color contrast', wcag: ['WCAG 2.1 AA 1.4.3'], nodes: [] },
  { id: 'image-alt', impact: 'critical', description: 'Image alt', wcag: ['WCAG 2.1 A 1.1.1'], nodes: [] },
  { id: 'label', impact: 'minor', description: 'Label', wcag: ['WCAG 2.1 A 1.3.1'], nodes: [] },
];

describe('filterEntries', () => {
  it('filters by impact level', () => {
    const entries = [makeEntry('http://example.com', mockViolations)];
    const result = filterEntries(entries, { impact: ['critical'] });
    expect(result[0].violations).toHaveLength(1);
    expect(result[0].violations[0].id).toBe('image-alt');
  });

  it('filters by multiple impact levels', () => {
    const entries = [makeEntry('http://example.com', mockViolations)];
    const result = filterEntries(entries, { impact: ['serious', 'critical'] });
    expect(result[0].violations).toHaveLength(2);
  });

  it('filters by ruleIds', () => {
    const entries = [makeEntry('http://example.com', mockViolations)];
    const result = filterEntries(entries, { ruleIds: ['label'] });
    expect(result[0].violations).toHaveLength(1);
    expect(result[0].violations[0].id).toBe('label');
  });

  it('filters by urlPattern', () => {
    const entries = [
      makeEntry('http://example.com/page1', mockViolations),
      makeEntry('http://example.com/admin', mockViolations),
    ];
    const result = filterEntries(entries, { urlPattern: '/page' });
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('http://example.com/page1');
  });

  it('removes entries with no remaining violations', () => {
    const entries = [makeEntry('http://example.com', mockViolations)];
    const result = filterEntries(entries, { ruleIds: ['nonexistent'] });
    expect(result).toHaveLength(0);
  });
});

describe('filterReport', () => {
  const mockReport: AuditReport = {
    generatedAt: '2024-01-01T00:00:00.000Z',
    baseUrl: 'http://example.com',
    entries: [makeEntry('http://example.com', mockViolations)],
    summary: { totalPages: 1, totalViolations: 3, pagesWithViolations: 1 },
  };

  it('returns filtered report with updated summary', () => {
    const result = filterReport(mockReport, { impact: ['critical'] });
    expect(result.summary.totalViolations).toBe(1);
    expect(result.summary.pagesWithViolations).toBe(1);
  });
});

describe('sortEntriesByImpact', () => {
  it('sorts entries by highest impact descending', () => {
    const entries = [
      makeEntry('http://a.com', [mockViolations[2]]),
      makeEntry('http://b.com', [mockViolations[1]]),
      makeEntry('http://c.com', [mockViolations[0]]),
    ];
    const sorted = sortEntriesByImpact(entries);
    expect(sorted[0].url).toBe('http://b.com');
    expect(sorted[1].url).toBe('http://c.com');
    expect(sorted[2].url).toBe('http://a.com');
  });
});
