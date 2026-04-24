/**
 * Severity utilities for accessibility violations.
 * Maps axe-core impact levels to numeric severity scores
 * and provides sorting/filtering helpers.
 */

export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';

export const IMPACT_SCORE: Record<ImpactLevel, number> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
};

export const IMPACT_LEVELS: ImpactLevel[] = ['critical', 'serious', 'moderate', 'minor'];

/**
 * Returns the numeric severity score for a given impact level.
 * Unknown levels return 0.
 */
export function getImpactScore(impact: string | undefined): number {
  if (!impact) return 0;
  return IMPACT_SCORE[impact as ImpactLevel] ?? 0;
}

/**
 * Returns true if the given impact meets the minimum threshold.
 */
export function meetsMinImpact(
  impact: string | undefined,
  minImpact: ImpactLevel
): boolean {
  return getImpactScore(impact) >= getImpactScore(minImpact);
}

/**
 * Sorts an array of items by impact descending (critical first).
 */
export function sortByImpact<T>(items: T[], getImpact: (item: T) => string | undefined): T[] {
  return [...items].sort((a, b) => {
    return getImpactScore(getImpact(b)) - getImpactScore(getImpact(a));
  });
}

/**
 * Returns a human-readable label with emoji for an impact level.
 */
export function impactLabel(impact: string | undefined): string {
  switch (impact as ImpactLevel) {
    case 'critical': return '🔴 critical';
    case 'serious':  return '🟠 serious';
    case 'moderate': return '🟡 moderate';
    case 'minor':    return '🔵 minor';
    default:         return '⚪ unknown';
  }
}
