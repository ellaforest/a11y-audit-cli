import {
  formatSummary,
  entryToText,
  entryToCsvRows,
  formatReport,
} from './formatter';
import type { AuditReport, ReportEntry } from './types';

const mockEntry: ReportEntry = {
  url: 'https://example.com/page',
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Elements must have sufficient color contrast',
      wcagCriteria: ['1.4.3'],
      wcagLevel: 'AA',
      nodes: [
        {
          html: '<p class="low-contrast">Text</p>',
          target: ['.low-contrast'],
          failureSummary: 'Fix color contrast ratio',
        },
      ],
    },
  ],
};

const mockReport: AuditReport = {
  generatedAt: '2024-01-01T00:00:00.000Z',
  totalPages: 2,
  totalViolations: 3,
  entries: [mockEntry],
};

describe('formatSummary', () => {
  it('returns a formatted summary string', () => {
    const result = formatSummary(mockReport);
    expect(result).toContain('2024-01-01');
    expect(result).toContain('2');
    expect(result).toContain('3');
  });
});

describe('entryToText', () => {
  it('formats a report entry as human-readable text', () => {
    const result = entryToText(mockEntry);
    expect(result).toContain('https://example.com/page');
    expect(result).toContain('color-contrast');
    expect(result).toContain('serious');
    expect(result).toContain('1.4.3');
  });

  it('returns a message when no violations exist', () => {
    const clean: ReportEntry = { url: 'https://example.com', violations: [] };
    const result = entryToText(clean);
    expect(result).toContain('No violations');
  });
});

describe('entryToCsvRows', () => {
  it('returns CSV rows for each violation node', () => {
    const rows = entryToCsvRows(mockEntry);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toContain('https://example.com/page');
    expect(rows[0]).toContain('color-contrast');
    expect(rows[0]).toContain('serious');
  });

  it('returns empty array when no violations', () => {
    const clean: ReportEntry = { url: 'https://example.com', violations: [] };
    expect(entryToCsvRows(clean)).toEqual([]);
  });
});

describe('formatReport', () => {
  it('formats the full report as text', () => {
    const result = formatReport(mockReport, 'text');
    expect(result).toContain('https://example.com/page');
    expect(result).toContain('color-contrast');
  });

  it('formats the full report as CSV with header', () => {
    const result = formatReport(mockReport, 'csv');
    expect(result).toContain('url,violationId,impact,wcagCriteria');
    expect(result).toContain('https://example.com/page');
  });

  it('formats the full report as JSON', () => {
    const result = formatReport(mockReport, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.totalPages).toBe(2);
    expect(parsed.entries).toHaveLength(1);
  });
});
