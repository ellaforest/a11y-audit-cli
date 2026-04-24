export interface FormattedViolation {
  id: string;
  impact: string;
  description: string;
  wcag: string[];
  nodes: NodeSummary[];
}

export interface NodeSummary {
  html: string;
  target: string;
  failureSummary: string;
}

export interface ReportEntry {
  url: string;
  violations: FormattedViolation[];
}

export interface ReportSummary {
  totalPages: number;
  totalViolations: number;
  pagesWithViolations: number;
}

export interface AuditReport {
  generatedAt: string;
  baseUrl: string;
  entries: ReportEntry[];
  summary: ReportSummary;
}

export type OutputFormat = 'json' | 'text' | 'csv';

export interface ReporterOptions {
  format: OutputFormat;
  outputPath?: string;
  filter?: import('./filter').FilterOptions;
  sortByImpact?: boolean;
}
