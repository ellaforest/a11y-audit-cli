import { describe, it, expect } from 'vitest';
import { buildReport, serializeReport } from './reporter';
import type { AuditResult } from '../auditor/types';

const mockViolation: AuditResult['violations'][number] = {
  id: 'color-contrast',
  impact: 'serious',
  description: 'Elements must have sufficient color contrast',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
  wcagCriteria: ['1.4.3'],
  wcagLevel: 'AA',
  nodes: [
    {
      html: '<p style="color:#aaa">text</p>',
      failureSummary: 'Fix contrast ratio',
      target: ['p'],
    },
  ],
};

const mockResult: AuditResult = {
  url: 'https://example.com',
  timestamp: '2024-01-01T00:00:00.000Z',
  violations: [mockViolation],
};

describe('buildReport', () => {
  it('returns a report with correct metadata', () => {
    const report = buildReport([mockResult], 'https://example.com');
    expect(report.baseUrl).toBe('https://example.com');
    expect(report.pagesAudited).toBe(1);
    expect(report.totalViolations).toBe(1);
    expect(report.entries).toHaveLength(1);
    expect(report.summaries).toHaveLength(1);
  });

  it('correctly counts violations by impact', () => {
    const report = buildReport([mockResult], 'https://example.com');
    const summary = report.summaries[0];
    expect(summary.seriousCount).toBe(1);
    expect(summary.criticalCount).toBe(0);
    expect(summary.moderateCount).toBe(0);
    expect(summary.minorCount).toBe(0);
  });

  it('maps violation fields correctly', () => {
    const report = buildReport([mockResult], 'https://example.com');
    const violation = report.entries[0].violations[0];
    expect(violation.id).toBe('color-contrast');
    expect(violation.wcagCriteria).toContain('1.4.3');
    expect(violation.wcagLevel).toBe('AA');
    expect(violation.nodes).toHaveLength(1);
  });
});

describe('serializeReport', () => {
  it('serializes to valid JSON', () => {
    const report = buildReport([mockResult], 'https://example.com');
    const output = serializeReport(report, 'json');
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.totalViolations).toBe(1);
  });

  it('serializes to CSV with header row', () => {
    const report = buildReport([mockResult], 'https://example.com');
    const output = serializeReport(report, 'csv');
    const lines = output.split('\n');
    expect(lines[0]).toContain('url,impact,violationId');
    expect(lines.length).toBeGreaterThan(1);
  });

  it('CSV rows contain violation data', () => {
    const report = buildReport([mockResult], 'https://example.com');
    const output = serializeReport(report, 'csv');
    expect(output).toContain('color-contrast');
    expect(output).toContain('serious');
    expect(output).toContain('https://example.com');
  });
});
