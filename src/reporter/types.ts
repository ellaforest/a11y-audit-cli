export type ReportFormat = 'json' | 'csv' | 'html';

export interface ViolationSummary {
  url: string;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
}

export interface ReportEntry {
  url: string;
  timestamp: string;
  violations: FormattedViolation[];
}

export interface FormattedViolation {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  wcagCriteria: string[];
  wcagLevel: string;
  nodes: NodeSummary[];
}

export interface NodeSummary {
  html: string;
  failureSummary: string;
  target: string[];
}

export interface AuditReport {
  generatedAt: string;
  baseUrl: string;
  pagesAudited: number;
  totalViolations: number;
  summaries: ViolationSummary[];
  entries: ReportEntry[];
}
