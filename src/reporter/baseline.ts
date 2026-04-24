import * as fs from "fs";
import * as path from "path";
import type { AuditReport } from "./types";

export interface BaselineEntry {
  url: string;
  ruleId: string;
  impact: string;
  description: string;
}

export function reportToBaseline(report: AuditReport): BaselineEntry[] {
  const entries: BaselineEntry[] = [];
  for (const entry of report.entries) {
    for (const violation of entry.violations) {
      entries.push({
        url: entry.url,
        ruleId: violation.id,
        impact: violation.impact ?? "unknown",
        description: violation.description,
      });
    }
  }
  return entries;
}

export function loadBaseline(baselinePath: string): BaselineEntry[] {
  const resolved = path.resolve(baselinePath);
  if (!fs.existsSync(resolved)) {
    return [];
  }
  const raw = fs.readFileSync(resolved, "utf-8");
  return JSON.parse(raw) as BaselineEntry[];
}

export function saveBaseline(baselinePath: string, entries: BaselineEntry[]): void {
  const resolved = path.resolve(baselinePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(entries, null, 2), "utf-8");
}

export function diffBaseline(
  current: BaselineEntry[],
  baseline: BaselineEntry[]
): { newViolations: BaselineEntry[]; resolvedViolations: BaselineEntry[] } {
  const key = (e: BaselineEntry) => `${e.url}::${e.ruleId}`;
  const baselineKeys = new Set(baseline.map(key));
  const currentKeys = new Set(current.map(key));

  return {
    newViolations: current.filter((e) => !baselineKeys.has(key(e))),
    resolvedViolations: baseline.filter((e) => !currentKeys.has(key(e))),
  };
}
