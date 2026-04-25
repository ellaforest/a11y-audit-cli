import { ReportEntry } from './types';

export type GroupKey = 'rule' | 'url' | 'impact';

export interface GroupedEntries {
  key: string;
  entries: ReportEntry[];
  count: number;
}

/**
 * Groups report entries by a given key.
 */
export function groupEntries(
  entries: ReportEntry[],
  by: GroupKey
): GroupedEntries[] {
  const map = new Map<string, ReportEntry[]>();

  for (const entry of entries) {
    const key = resolveGroupKey(entry, by);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(entry);
  }

  return Array.from(map.entries())
    .map(([key, entries]) => ({ key, entries, count: entries.length }))
    .sort((a, b) => b.count - a.count);
}

function resolveGroupKey(entry: ReportEntry, by: GroupKey): string {
  switch (by) {
    case 'rule':
      return entry.ruleId;
    case 'url':
      return entry.url;
    case 'impact':
      return entry.impact ?? 'unknown';
    default:
      return entry.ruleId;
  }
}

/**
 * Returns a flat summary string for each group.
 */
export function formatGroupSummary(groups: GroupedEntries[]): string {
  return groups
    .map((g) => `${g.key} (${g.count} violation${g.count !== 1 ? 's' : ''})`)
    .join('\n');
}
