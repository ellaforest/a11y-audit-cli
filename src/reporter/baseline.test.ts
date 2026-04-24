import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  reportToBaseline,
  loadBaseline,
  saveBaseline,
  diffBaseline,
  type BaselineEntry,
} from "./baseline";
import type { AuditReport } from "./types";

const TMP_PATH = path.join(__dirname, "__tmp_baseline_test__.json");

const mockReport: AuditReport = {
  generatedAt: "2024-01-01T00:00:00.000Z",
  summary: { totalUrls: 1, totalViolations: 1, bySeverity: {}, topRules: [] },
  entries: [
    {
      url: "https://example.com",
      violations: [
        {
          id: "color-contrast",
          impact: "serious",
          description: "Ensure sufficient color contrast",
          wcag: [],
          nodes: [],
        },
      ],
    },
  ],
};

beforeEach(() => {
  if (fs.existsSync(TMP_PATH)) fs.unlinkSync(TMP_PATH);
});

afterEach(() => {
  if (fs.existsSync(TMP_PATH)) fs.unlinkSync(TMP_PATH);
});

describe("reportToBaseline", () => {
  it("converts report entries to baseline entries", () => {
    const result = reportToBaseline(mockReport);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      url: "https://example.com",
      ruleId: "color-contrast",
      impact: "serious",
    });
  });

  it("returns empty array for report with no violations", () => {
    const empty: AuditReport = { ...mockReport, entries: [] };
    expect(reportToBaseline(empty)).toEqual([]);
  });
});

describe("loadBaseline", () => {
  it("returns empty array when file does not exist", () => {
    expect(loadBaseline("/nonexistent/path.json")).toEqual([]);
  });

  it("loads saved baseline from disk", () => {
    const entries: BaselineEntry[] = [
      { url: "https://a.com", ruleId: "aria-label", impact: "critical", description: "Missing aria" },
    ];
    fs.writeFileSync(TMP_PATH, JSON.stringify(entries), "utf-8");
    expect(loadBaseline(TMP_PATH)).toEqual(entries);
  });
});

describe("saveBaseline", () => {
  it("writes baseline entries to disk as JSON", () => {
    const entries: BaselineEntry[] = [
      { url: "https://b.com", ruleId: "image-alt", impact: "serious", description: "Alt text" },
    ];
    saveBaseline(TMP_PATH, entries);
    const raw = JSON.parse(fs.readFileSync(TMP_PATH, "utf-8"));
    expect(raw).toEqual(entries);
  });
});

describe("diffBaseline", () => {
  const base: BaselineEntry[] = [
    { url: "https://x.com", ruleId: "color-contrast", impact: "serious", description: "" },
  ];
  const current: BaselineEntry[] = [
    { url: "https://x.com", ruleId: "image-alt", impact: "critical", description: "" },
  ];

  it("identifies new violations not in baseline", () => {
    const { newViolations } = diffBaseline(current, base);
    expect(newViolations).toHaveLength(1);
    expect(newViolations[0].ruleId).toBe("image-alt");
  });

  it("identifies resolved violations from baseline", () => {
    const { resolvedViolations } = diffBaseline(current, base);
    expect(resolvedViolations).toHaveLength(1);
    expect(resolvedViolations[0].ruleId).toBe("color-contrast");
  });

  it("returns empty arrays when current matches baseline", () => {
    const { newViolations, resolvedViolations } = diffBaseline(base, base);
    expect(newViolations).toHaveLength(0);
    expect(resolvedViolations).toHaveLength(0);
  });
});
