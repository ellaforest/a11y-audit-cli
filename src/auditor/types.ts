export interface WCAGReference {
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  url: string;
}

export interface Violation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  wcag: WCAGReference[];
  nodes: ViolationNode[];
}

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface AuditResult {
  url: string;
  timestamp: string;
  violations: Violation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
}

export interface AuditorOptions {
  wcagLevel?: 'A' | 'AA' | 'AAA';
  rules?: string[];
  timeout?: number;
}
