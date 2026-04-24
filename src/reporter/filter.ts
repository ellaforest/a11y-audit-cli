import { AuditReport, ReportEntry } from './types';

export type ImpactLevel = 'minor' | 'moderate' | 'serious' | 'critical';

export interface FilterOptions {
  impact?: ImpactLevel[];
  wcagLevels?: string[];
  ruleIds?: string[];
  urlPattern?: string;
}

const IMPACT_ORDER: Record<ImpactLevel, number> = {
  minor: 1,
  moderate: 2,
  serious: 3,
  critical: 4,
};

export function filterEntries(
  entries: ReportEntry[],
  options: FilterOptions
): ReportEntry[] {
  return entries
    .map((entry) => ({
      ...entry,
      violations: entry.violations.filter((v) => {
        if (
          options.impact &&
          options.impact.length > 0 &&
          !options.impact.includes(v.impact as ImpactLevel)
        ) {
          return false;
        }
        if (
          options.wcagLevels &&
          options.wcagLevels.length > 0 &&
          !options.wcagLevels.some((level) =>
            v.wcag?.some((ref) => ref.includes(level))
          )
        ) {
          return false;
        }
        if (
          options.ruleIds &&
          options.ruleIds.length > 0 &&
          !options.ruleIds.includes(v.id)
        ) {
          return false;
        }
        return true;
      }),
    }))
    .filter((entry) => {
      if (options.urlPattern) {
        const regex = new RegExp(options.urlPattern);
        if (!regex.test(entry.url)) return false;
      }
      return entry.violations.length > 0;
    });
}

export function filterReport(
  report: AuditReport,
  options: FilterOptions
): AuditReport {
  const filteredEntries = filterEntries(report.entries, options);
  const totalViolations = filteredEntries.reduce(
    (sum, e) => sum + e.violations.length,
    0
  );
  return {
    ...report,
    entries: filteredEntries,
    summary: {
      ...report.summary,
      totalViolations,
      pagesWithViolations: filteredEntries.length,
    },
  };
}

export function sortEntriesByImpact(entries: ReportEntry[]): ReportEntry[] {
  return [...entries].sort((a, b) => {
    const maxImpact = (entry: ReportEntry): number =>
      Math.max(
        0,
        ...entry.violations.map(
          (v) => IMPACT_ORDER[v.impact as ImpactLevel] ?? 0
        )
      );
    return maxImpact(b) - maxImpact(a);
  });
}
