import { describe, it, expect, vi, beforeEach } from "vitest";
import { runBaselineCommand, formatBaselineResult } from "./baseline-command";
import * as baselineModule from "../reporter/baseline";
import type { AuditReport } from "../reporter/types";

const mockReport: AuditReport = {
  generatedAt: "2024-01-01T00:00:00.000Z",
  summary: { totalUrls: 1, totalViolations: 1, bySeverity: {}, topRules: [] },
  entries: [
    {
      url: "https://example.com",
      violations: [
        {
          id: "image-alt",
          impact: "critical",
          description: "Images must have alt text",
          wcag: [],
          nodes: [],
        },
      ],
    },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("runBaselineCommand", () => {
  it("returns null when no baseline option is set", () => {
    const result = runBaselineCommand(mockReport, { baseline: undefined, updateBaseline: false });
    expect(result).toBeNull();
  });

  it("saves baseline and returns update mode result", () => {
    const saveSpy = vi.spyOn(baselineModule, "saveBaseline").mockImplementation(() => {});
    const result = runBaselineCommand(mockReport, { baseline: "baseline.json", updateBaseline: true });
    expect(saveSpy).toHaveBeenCalledOnce();
    expect(result?.mode).toBe("update");
    expect(result?.newCount).toBe(0);
  });

  it("compares against existing baseline and reports new violations", () => {
    vi.spyOn(baselineModule, "loadBaseline").mockReturnValue([]);
    const result = runBaselineCommand(mockReport, { baseline: "baseline.json", updateBaseline: false });
    expect(result?.mode).toBe("compare");
    expect(result?.newCount).toBe(1);
    expect(result?.resolvedCount).toBe(0);
    expect(result?.newViolations[0].ruleId).toBe("image-alt");
  });

  it("reports resolved violations when current has fewer issues", () => {
    vi.spyOn(baselineModule, "loadBaseline").mockReturnValue([
      { url: "https://example.com", ruleId: "image-alt", impact: "critical", description: "" },
      { url: "https://example.com", ruleId: "color-contrast", impact: "serious", description: "" },
    ]);
    const result = runBaselineCommand(mockReport, { baseline: "baseline.json", updateBaseline: false });
    expect(result?.resolvedCount).toBe(1);
    expect(result?.newCount).toBe(0);
  });
});

describe("formatBaselineResult", () => {
  it("formats update mode message", () => {
    const msg = formatBaselineResult({ mode: "update", newCount: 0, resolvedCount: 0, newViolations: [] });
    expect(msg).toContain("updated");
  });

  it("formats compare mode with new violations", () => {
    const msg = formatBaselineResult({
      mode: "compare",
      newCount: 1,
      resolvedCount: 0,
      newViolations: [{ url: "https://a.com", ruleId: "image-alt", impact: "critical" }],
    });
    expect(msg).toContain("1 new");
    expect(msg).toContain("image-alt");
    expect(msg).toContain("critical");
  });

  it("formats compare mode with no new violations", () => {
    const msg = formatBaselineResult({ mode: "compare", newCount: 0, resolvedCount: 2, newViolations: [] });
    expect(msg).toContain("0 new");
    expect(msg).toContain("2 resolved");
    expect(msg).not.toContain("New violations");
  });
});
