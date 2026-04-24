import { runCli } from './cli';
import * as crawler from '../crawler';
import * as auditor from '../auditor';
import * as reporter from '../reporter';
import * as formatter from '../reporter/formatter';
import * as fs from 'fs';

jest.mock('../crawler');
jest.mock('../auditor');
jest.mock('../reporter');
jest.mock('../reporter/formatter');
jest.mock('fs');

const mockCrawl = crawler.crawl as jest.MockedFunction<typeof crawler.crawl>;
const mockAudit = auditor.audit as jest.MockedFunction<typeof auditor.audit>;
const mockBuildReport = reporter.buildReport as jest.MockedFunction<typeof reporter.buildReport>;
const mockFormatReport = formatter.formatReport as jest.MockedFunction<typeof formatter.formatReport>;
const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

const fakePages = [{ url: 'https://example.com', html: '<html></html>' }] as any;
const fakeAuditResults = [{ url: 'https://example.com', violations: [] }] as any;
const fakeReport = { summary: {}, entries: [] } as any;
const fakeFormatted = 'formatted output';

beforeEach(() => {
  jest.clearAllMocks();
  mockCrawl.mockResolvedValue(fakePages);
  mockAudit.mockResolvedValue(fakeAuditResults);
  mockBuildReport.mockReturnValue(fakeReport);
  mockFormatReport.mockReturnValue(fakeFormatted);
});

describe('runCli', () => {
  it('crawls and audits with default options and writes to stdout', async () => {
    const writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    await runCli(['node', 'a11y-audit', '--url', 'https://example.com']);

    expect(mockCrawl).toHaveBeenCalledWith('https://example.com', { maxDepth: 2 });
    expect(mockAudit).toHaveBeenCalledWith(fakePages, { wcagLevel: 'AA' });
    expect(mockBuildReport).toHaveBeenCalledWith(fakeAuditResults);
    expect(mockFormatReport).toHaveBeenCalledWith(fakeReport, 'text');
    expect(writeSpy).toHaveBeenCalledWith(fakeFormatted + '\n');
    writeSpy.mockRestore();
  });

  it('writes output to a file when --out-file is provided', async () => {
    await runCli(['node', 'a11y-audit', '--url', 'https://example.com', '--out-file', 'report.txt']);

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('report.txt'),
      fakeFormatted,
      'utf-8'
    );
  });

  it('passes depth and wcag-level options correctly', async () => {
    const writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    await runCli(['node', 'a11y-audit', '--url', 'https://example.com', '--depth', '3', '--wcag-level', 'AAA', '--output', 'csv']);

    expect(mockCrawl).toHaveBeenCalledWith('https://example.com', { maxDepth: 3 });
    expect(mockAudit).toHaveBeenCalledWith(fakePages, { wcagLevel: 'AAA' });
    expect(mockFormatReport).toHaveBeenCalledWith(fakeReport, 'csv');
    writeSpy.mockRestore();
  });

  it('exits with code 1 for invalid output format', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: number) => { throw new Error(`exit:${code}`); });
    await expect(
      runCli(['node', 'a11y-audit', '--url', 'https://example.com', '--output', 'xml'])
    ).rejects.toThrow('exit:1');
    exitSpy.mockRestore();
  });
});
