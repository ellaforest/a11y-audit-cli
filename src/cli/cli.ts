import { Command } from 'commander';
import { crawl } from '../crawler';
import { audit } from '../auditor';
import { buildReport } from '../reporter';
import { formatReport } from '../reporter/formatter';
import * as fs from 'fs';
import * as path from 'path';

export interface CliOptions {
  url: string;
  depth: number;
  output: 'text' | 'csv' | 'json';
  outFile?: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command();

  program
    .name('a11y-audit')
    .description('Crawl a site and output structured accessibility violation reports with WCAG references')
    .version('1.0.0');

  program
    .requiredOption('-u, --url <url>', 'Starting URL to crawl')
    .option('-d, --depth <number>', 'Maximum crawl depth', '2')
    .option('-o, --output <format>', 'Output format: text, csv, or json', 'text')
    .option('-f, --out-file <path>', 'Write output to file instead of stdout')
    .option('-l, --wcag-level <level>', 'WCAG conformance level: A, AA, or AAA', 'AA');

  program.parse(argv);

  const opts = program.opts();
  const options: CliOptions = {
    url: opts.url,
    depth: parseInt(opts.depth, 10),
    output: opts.output as CliOptions['output'],
    outFile: opts.outFile,
    wcagLevel: opts.wcagLevel as CliOptions['wcagLevel'],
  };

  if (!['text', 'csv', 'json'].includes(options.output)) {
    console.error(`Invalid output format: ${options.output}. Must be text, csv, or json.`);
    process.exit(1);
  }

  if (!['A', 'AA', 'AAA'].includes(options.wcagLevel)) {
    console.error(`Invalid WCAG level: ${options.wcagLevel}. Must be A, AA, or AAA.`);
    process.exit(1);
  }

  console.error(`Crawling ${options.url} (depth: ${options.depth})...`);
  const pages = await crawl(options.url, { maxDepth: options.depth });
  console.error(`Auditing ${pages.length} page(s)...`);

  const auditResults = await audit(pages, { wcagLevel: options.wcagLevel });
  const report = buildReport(auditResults);
  const formatted = formatReport(report, options.output);

  if (options.outFile) {
    const outPath = path.resolve(options.outFile);
    fs.writeFileSync(outPath, formatted, 'utf-8');
    console.error(`Report written to ${outPath}`);
  } else {
    process.stdout.write(formatted + '\n');
  }
}
