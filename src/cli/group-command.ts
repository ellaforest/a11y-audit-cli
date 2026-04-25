import { Report } from '../reporter/types';
import { groupEntries, formatGroupSummary, GroupKey } from '../reporter/grouping';

export interface GroupCommandOptions {
  by: GroupKey;
  topN?: number;
}

/**
 * Runs the grouping command against a report and returns formatted output.
 */
export function runGroupCommand(
  report: Report,
  options: GroupCommandOptions
): string {
  const allEntries = report.entries;

  if (allEntries.length === 0) {
    return 'No violations found to group.';
  }

  let groups = groupEntries(allEntries, options.by);

  if (options.topN !== undefined && options.topN > 0) {
    groups = groups.slice(0, options.topN);
  }

  const header = `Grouped by: ${options.by} (${groups.length} group${groups.length !== 1 ? 's' : ''})`;
  const body = formatGroupSummary(groups);

  return `${header}\n${'-'.repeat(header.length)}\n${body}`;
}

/**
 * Parses the --group-by CLI argument into a valid GroupKey.
 */
export function parseGroupKey(value: string): GroupKey {
  const valid: GroupKey[] = ['rule', 'url', 'impact'];
  if (valid.includes(value as GroupKey)) {
    return value as GroupKey;
  }
  throw new Error(
    `Invalid --group-by value: "${value}". Must be one of: ${valid.join(', ')}`
  );
}
