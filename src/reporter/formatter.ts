import type { AuditReport, ReportEntry } from './types';

export type OutputFormat = 'text' | 'csv' | 'json';

const CSV_HEADER = 'url,violationId,impact,wcagCriteria,wcagLevel,nodeHtml,failureSummary';

export function formatSummary(report: AuditReport): string {
  const lines = [
    '='.repeat(60),
    'A11Y AUDIT SUMMARY',
    '='.repeat(60),
    `Generated : ${report.generatedAt}`,
    `Pages     : ${report.totalPages}`,
    `Violations: ${report.totalViolations}`,
    '='.repeat(60),
  ];
  return lines.join('\n');
}

export function entryToText(entry: ReportEntry): string {
  const lines: string[] = [`\nURL: ${entry.url}`];

  if (entry.violations.length === 0) {
    lines.push('  No violations found.');
    return lines.join('\n');
  }

  for (const v of entry.violations) {
    lines.push(`  [${v.impact?.toUpperCase() ?? 'UNKNOWN'}] ${v.id}`);
    lines.push(`    Description : ${v.description}`);
    lines.push(`    WCAG        : ${v.wcagCriteria.join(', ')} (Level ${v.wcagLevel})`);
    lines.push(`    Nodes (${v.nodes.length}):`);
    for (const node of v.nodes) {
      lines.push(`      • ${node.html.slice(0, 80)}`);
      if (node.failureSummary) {
        lines.push(`        → ${node.failureSummary}`);
      }
    }
  }

  return lines.join('\n');
}

export function entryToCsvRows(entry: ReportEntry): string[] {
  const rows: string[] = [];

  for (const v of entry.violations) {
    const wcag = v.wcagCriteria.join(';');
    for (const node of v.nodes) {
      const cols = [
        csvEscape(entry.url),
        csvEscape(v.id),
        csvEscape(v.impact ?? ''),
        csvEscape(wcag),
        csvEscape(v.wcagLevel),
        csvEscape(node.html),
        csvEscape(node.failureSummary ?? ''),
      ];
      rows.push(cols.join(','));
    }
  }

  return rows;
}

export function formatReport(report: AuditReport, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }

  if (format === 'csv') {
    const rows = [CSV_HEADER];
    for (const entry of report.entries) {
      rows.push(...entryToCsvRows(entry));
    }
    return rows.join('\n');
  }

  // text
  const parts = [formatSummary(report)];
  for (const entry of report.entries) {
    parts.push(entryToText(entry));
  }
  return parts.join('\n');
}

function csvEscape(value: string): string {
  if (/[,"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
