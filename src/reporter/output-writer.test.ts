import * as fs from 'fs';
import * as path from 'path';
import { writeOutput, serializeReport, resolveOutputPath, OutputFormat } from './output-writer';
import { AuditReport } from './types';

const mockReport: AuditReport = {
  generatedAt: '2024-01-01T00:00:00.000Z',
  summary: { totalPages: 1, totalViolations: 0, violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 } },
  entries: [],
};

describe('resolveOutputPath', () => {
  it('returns undefined when no outputPath provided', () => {
    expect(resolveOutputPath(undefined, 'text')).toBeUndefined();
  });

  it('appends .txt extension for text format', () => {
    expect(resolveOutputPath('report', 'text')).toBe('report.txt');
  });

  it('appends .csv extension for csv format', () => {
    expect(resolveOutputPath('report', 'csv')).toBe('report.csv');
  });

  it('appends .json extension for json format', () => {
    expect(resolveOutputPath('report', 'json')).toBe('report.json');
  });

  it('preserves existing extension', () => {
    expect(resolveOutputPath('report.txt', 'csv')).toBe('report.txt');
  });
});

describe('serializeReport', () => {
  it('returns valid JSON string for json format', () => {
    const result = serializeReport(mockReport, 'json');
    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toMatchObject({ entries: [] });
  });

  it('returns non-empty string for text format', () => {
    const result = serializeReport(mockReport, 'text');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns non-empty string for csv format', () => {
    const result = serializeReport(mockReport, 'csv');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('writeOutput', () => {
  const tmpFile = path.join(__dirname, '__tmp_test_output');

  afterEach(() => {
    ['txt', 'csv', 'json'].forEach(ext => {
      const f = `${tmpFile}.${ext}`;
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  });

  it('writes json file to disk', () => {
    writeOutput(mockReport, { format: 'json', outputPath: tmpFile });
    expect(fs.existsSync(`${tmpFile}.json`)).toBe(true);
    const content = fs.readFileSync(`${tmpFile}.json`, 'utf8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('writes to stdout when no outputPath given', () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    writeOutput(mockReport, { format: 'text' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
