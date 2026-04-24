import type { Report, ReportEntry, ReportSummary } from './types';

export type OutputFormat = 'json' | 'text' | 'csv';

function formatSummary(summary: ReportSummary): string {
  return [
    `Pages audited : ${summary.totalPages}`,
    `Total violations: ${summary.totalViolations}`,
    `Critical        : ${summary.bySeverity.critical ?? 0}`,
    `Serious         : ${summary.bySeverity.serious ?? 0}`,
    `Moderate        : ${summary.bySeverity.moderate ?? 0}`,
    `Minor           : ${summary.bySeverity.minor ?? 0}`,
  ].join('\n');
}

function entryToText(entry: ReportEntry): string {
  const lines: string[] = [`\nURL: ${entry.url}`];
  if (entry.violations.length === 0) {
    lines.push('  No violations found.');
    return lines.join('\n');
  }
  for (const v of entry.violations) {
    lines.push(`  [${v.impact.toUpperCase()}] ${v.id} — ${v.description}`);
    lines.push(`    WCAG: ${v.wcagCriteria.join(', ')} | Help: ${v.helpUrl}`);
    for (const node of v.nodes) {
      lines.push(`    • ${node.target} — ${node.failureSummary}`);
    }
  }
  return lines.join('\n');
}

function entryToCsvRows(entry: ReportEntry): string[] {
  if (entry.violations.length === 0) {
    return [`"${entry.url}",,,,,`];
  }
  const rows: string[] = [];
  for (const v of entry.violations) {
    const targets = v.nodes.map((n) => n.target).join('; ');
    rows.push(
      [
        `"${entry.url}"`,
        `"${v.id}"`,
        `"${v.impact}"`,
        `"${v.wcagCriteria.join('; ')}"`,
        `"${v.description.replace(/"/g, "'")}",`,
        `"${targets}"`,
      ].join(',')
    );
  }
  return rows;
}

export function formatReport(report: Report, format: OutputFormat = 'text'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(report, null, 2);

    case 'csv': {
      const header = 'url,ruleId,impact,wcag,description,targets';
      const rows = report.entries.flatMap(entryToCsvRows);
      return [header, ...rows].join('\n');
    }

    case 'text':
    default: {
      const entriesText = report.entries.map(entryToText).join('\n');
      return `${formatSummary(report.summary)}\n${entriesText}`;
    }
  }
}
