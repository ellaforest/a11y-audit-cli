import type { ParsedCliOptions } from "./options";
import { loadBaseline, saveBaseline, diffBaseline, reportToBaseline } from "../reporter/baseline";
import type { AuditReport } from "../reporter/types";

export interface BaselineCommandResult {
  mode: "update" | "compare";
  newCount: number;
  resolvedCount: number;
  newViolations: Array<{ url: string; ruleId: string; impact: string }>;
}

export function runBaselineCommand(
  report: AuditReport,
  options: Pick<ParsedCliOptions, "baseline" | "updateBaseline">
): BaselineCommandResult | null {
  if (!options.baseline) return null;

  const current = reportToBaseline(report);

  if (options.updateBaseline) {
    saveBaseline(options.baseline, current);
    return {
      mode: "update",
      newCount: 0,
      resolvedCount: 0,
      newViolations: [],
    };
  }

  const existing = loadBaseline(options.baseline);
  const { newViolations, resolvedViolations } = diffBaseline(current, existing);

  return {
    mode: "compare",
    newCount: newViolations.length,
    resolvedCount: resolvedViolations.length,
    newViolations: newViolations.map(({ url, ruleId, impact }) => ({ url, ruleId, impact })),
  };
}

export function formatBaselineResult(result: BaselineCommandResult): string {
  if (result.mode === "update") {
    return "Baseline updated successfully.";
  }

  const lines: string[] = [
    `Baseline comparison: ${result.newCount} new, ${result.resolvedCount} resolved.`,
  ];

  if (result.newCount > 0) {
    lines.push("\nNew violations (not in baseline):");
    for (const v of result.newViolations) {
      lines.push(`  [${v.impact}] ${v.ruleId} @ ${v.url}`);
    }
  }

  return lines.join("\n");
}
