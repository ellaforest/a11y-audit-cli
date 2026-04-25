import { AuditReport } from './types';
import { computeSummaryStats } from './summary-stats';

export interface TrendSnapshot {
  timestamp: string;
  url: string;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  pagesAudited: number;
}

export interface TrendComparison {
  previous: TrendSnapshot;
  current: TrendSnapshot;
  delta: {
    totalViolations: number;
    criticalCount: number;
    seriousCount: number;
    moderateCount: number;
    minorCount: number;
  };
  improved: boolean;
  regressed: boolean;
}

export function reportToSnapshot(report: AuditReport): TrendSnapshot {
  const stats = computeSummaryStats(report.entries);
  return {
    timestamp: report.generatedAt,
    url: report.siteUrl,
    totalViolations: stats.totalViolations,
    criticalCount: stats.bySeverity.critical ?? 0,
    seriousCount: stats.bySeverity.serious ?? 0,
    moderateCount: stats.bySeverity.moderate ?? 0,
    minorCount: stats.bySeverity.minor ?? 0,
    pagesAudited: stats.totalPages,
  };
}

export function compareTrend(
  previous: TrendSnapshot,
  current: TrendSnapshot
): TrendComparison {
  const delta = {
    totalViolations: current.totalViolations - previous.totalViolations,
    criticalCount: current.criticalCount - previous.criticalCount,
    seriousCount: current.seriousCount - previous.seriousCount,
    moderateCount: current.moderateCount - previous.moderateCount,
    minorCount: current.minorCount - previous.minorCount,
  };
  return {
    previous,
    current,
    delta,
    improved: delta.totalViolations < 0,
    regressed: delta.totalViolations > 0,
  };
}

export function formatTrendComparison(comparison: TrendComparison): string {
  const { delta, improved, regressed } = comparison;
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const status = improved ? '✅ Improved' : regressed ? '❌ Regressed' : '➡️  No change';
  return [
    `Trend: ${status}`,
    `  Total violations: ${sign(delta.totalViolations)}`,
    `  Critical: ${sign(delta.criticalCount)}`,
    `  Serious:  ${sign(delta.seriousCount)}`,
    `  Moderate: ${sign(delta.moderateCount)}`,
    `  Minor:    ${sign(delta.minorCount)}`,
  ].join('\n');
}
