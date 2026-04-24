/**
 * Computes aggregate statistics from a collection of audit report entries
 * for use in summaries and dashboards.
 */

import type { ReportEntry } from './types';
import { IMPACT_LEVELS, type ImpactLevel, getImpactScore } from './severity';

export interface SummaryStats {
  totalPages: number;
  totalViolations: number;
  violationsByImpact: Record<ImpactLevel, number>;
  topViolations: Array<{ ruleId: string; count: number; impact: string | undefined }>;
  pagesWithViolations: number;
  averageViolationsPerPage: number;
}

/**
 * Builds a SummaryStats object from an array of ReportEntry items.
 */
export function computeSummaryStats(entries: ReportEntry[]): SummaryStats {
  const totalPages = entries.length;
  const pagesWithViolations = entries.filter((e) => e.violations.length > 0).length;

  const violationsByImpact: Record<ImpactLevel, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  const ruleCountMap = new Map<string, { count: number; impact: string | undefined }>();
  let totalViolations = 0;

  for (const entry of entries) {
    for (const violation of entry.violations) {
      totalViolations++;
      const impact = violation.impact as ImpactLevel | undefined;
      if (impact && impact in violationsByImpact) {
        violationsByImpact[impact]++;
      }
      const existing = ruleCountMap.get(violation.id);
      if (existing) {
        existing.count++;
      } else {
        ruleCountMap.set(violation.id, { count: 1, impact: violation.impact });
      }
    }
  }

  const topViolations = Array.from(ruleCountMap.entries())
    .map(([ruleId, { count, impact }]) => ({ ruleId, count, impact }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return getImpactScore(b.impact) - getImpactScore(a.impact);
    })
    .slice(0, 10);

  const averageViolationsPerPage =
    totalPages > 0 ? Math.round((totalViolations / totalPages) * 100) / 100 : 0;

  return {
    totalPages,
    totalViolations,
    violationsByImpact,
    topViolations,
    pagesWithViolations,
    averageViolationsPerPage,
  };
}
