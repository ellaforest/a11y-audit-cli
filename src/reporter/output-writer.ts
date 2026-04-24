import * as fs from 'fs';
import * as path from 'path';
import { AuditReport } from './types';
import { formatReport } from './formatter';

export type OutputFormat = 'text' | 'csv' | 'json';

export interface WriteOptions {
  format: OutputFormat;
  outputPath?: string;
}

export function resolveOutputPath(
  outputPath: string | undefined,
  format: OutputFormat
): string | undefined {
  if (!outputPath) return undefined;
  const ext = format === 'csv' ? '.csv' : format === 'json' ? '.json' : '.txt';
  if (path.extname(outputPath)) return outputPath;
  return `${outputPath}${ext}`;
}

export function serializeReport(
  report: AuditReport,
  format: OutputFormat
): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  return formatReport(report, format);
}

export function writeOutput(
  report: AuditReport,
  options: WriteOptions
): void {
  const serialized = serializeReport(report, options.format);
  const resolved = resolveOutputPath(options.outputPath, options.format);

  if (resolved) {
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolved, serialized, 'utf8');
  } else {
    process.stdout.write(serialized + '\n');
  }
}
