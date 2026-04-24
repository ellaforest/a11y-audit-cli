import type { AuditResult } from '../auditor/types';
import type {
  AuditReport,
  FormattedViolation,
  NodeSummary,
  ReportEntry,
  ViolationSummary,
} from './types';

export function buildReport(results: AuditResult[], baseUrl: string): AuditReport {
  const entries: ReportEntry[] = results.map(buildEntry);
  const summaries: ViolationSummary[] = results.map(buildSummary);
  const totalViolations = summaries.reduce((sum, s) => sum + s.totalViolations, 0);

  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    pagesAudited: results.length,
    totalViolations,
    summaries,
    entries,
  };
}

function buildEntry(result: AuditResult): ReportEntry {
  return {
    url: result.url,
    timestamp: result.timestamp,
    violations: result.violations.map(buildFormattedViolation),
  };
}

function buildFormattedViolation(v: AuditResult['violations'][number]): FormattedViolation {
  return {
    id: v.id,
    impact: v.impact ?? 'unknown',
    description: v.description,
    helpUrl: v.helpUrl,
    wcagCriteria: v.wcagCriteria,
    wcagLevel: v.wcagLevel,
    nodes: v.nodes.map(buildNodeSummary),
  };
}

function buildNodeSummary(node: AuditResult['violations'][number]['nodes'][number]): NodeSummary {
  return {
    html: node.html,
    failureSummary: node.failureSummary,
    target: node.target,
  };
}

function buildSummary(result: AuditResult): ViolationSummary {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const v of result.violations) {
    const impact = v.impact as keyof typeof counts;
    if (impact in counts) counts[impact]++;
  }
  return {
    url: result.url,
    totalViolations: result.violations.length,
    criticalCount: counts.critical,
    seriousCount: counts.serious,
    moderateCount: counts.moderate,
    minorCount: counts.minor,
  };
}

export function serializeReport(report: AuditReport, format: 'json' | 'csv'): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  const rows: string[] = [
    'url,impact,violationId,wcagCriteria,wcagLevel,description',
  ];
  for (const entry of report.entries) {
    for (const v of entry.violations) {
      const criteria = v.wcagCriteria.join('; ');
      const desc = v.description.replace(/,/g, ' ');
      rows.push(`${entry.url},${v.impact},${v.id},"${criteria}",${v.wcagLevel},"${desc}"`);
    }
  }
  return rows.join('\n');
}
