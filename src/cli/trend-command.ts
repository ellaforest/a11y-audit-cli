import * as fs from 'fs';
import { loadBaseline } from '../reporter/baseline';
import { reportToSnapshot, compareTrend, formatTrendComparison, TrendSnapshot } from '../reporter/trend';
import { AuditReport } from '../reporter/types';

export interface TrendCommandOptions {
  snapshotPath: string;
  reportPath?: string;
  report?: AuditReport;
}

export function loadSnapshot(snapshotPath: string): TrendSnapshot | null {
  if (!fs.existsSync(snapshotPath)) return null;
  try {
    const raw = fs.readFileSync(snapshotPath, 'utf-8');
    return JSON.parse(raw) as TrendSnapshot;
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshotPath: string, snapshot: TrendSnapshot): void {
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
}

export function runTrendCommand(options: TrendCommandOptions): string {
  const { snapshotPath, reportPath, report: inlineReport } = options;

  let report: AuditReport | null = null;

  if (inlineReport) {
    report = inlineReport;
  } else if (reportPath) {
    try {
      const raw = fs.readFileSync(reportPath, 'utf-8');
      report = JSON.parse(raw) as AuditReport;
    } catch {
      return `Error: could not read report from ${reportPath}`;
    }
  } else {
    return 'Error: no report provided for trend comparison';
  }

  const currentSnapshot = reportToSnapshot(report);
  const previousSnapshot = loadSnapshot(snapshotPath);

  saveSnapshot(snapshotPath, currentSnapshot);

  if (!previousSnapshot) {
    return [
      'No previous snapshot found — current snapshot saved.',
      `  Total violations: ${currentSnapshot.totalViolations}`,
      `  Pages audited:    ${currentSnapshot.pagesAudited}`,
    ].join('\n');
  }

  const comparison = compareTrend(previousSnapshot, currentSnapshot);
  return formatTrendComparison(comparison);
}
