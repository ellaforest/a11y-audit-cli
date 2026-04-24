#!/usr/bin/env node

/**
 * a11y-audit-cli
 * Main entry point — parses CLI arguments and orchestrates the crawl → audit → report pipeline.
 */

import { crawl } from './crawler';
import { audit } from './auditor';
import { buildReport } from './reporter';
import { formatReport } from './reporter/formatter';
import { runCli } from './cli/cli';

async function main(): Promise<void> {
  // Parse CLI flags (url, depth, format, output, etc.)
  const options = await runCli(process.argv.slice(2));

  if (!options) {
    // runCli already printed help / error; exit cleanly
    process.exit(0);
  }

  const { url, depth, format, output, quiet } = options;

  if (!quiet) {
    console.log(`\n🔍  Starting accessibility audit for: ${url}`);
    console.log(`    Crawl depth : ${depth}`);
    console.log(`    Output format: ${format}\n`);
  }

  // ── 1. Crawl ────────────────────────────────────────────────────────────────
  let pages: Awaited<ReturnType<typeof crawl>>;
  try {
    pages = await crawl({ url, maxDepth: depth });
  } catch (err) {
    console.error('❌  Crawl failed:', (err as Error).message);
    process.exit(1);
  }

  if (!quiet) {
    console.log(`✅  Crawled ${pages.length} page(s).\n`);
  }

  // ── 2. Audit ─────────────────────────────────────────────────────────────────
  const auditResults: Awaited<ReturnType<typeof audit>>[] = [];
  for (const page of pages) {
    try {
      const result = await audit(page);
      auditResults.push(result);
    } catch (err) {
      // Non-fatal: log and continue with remaining pages
      console.warn(`⚠️   Audit failed for ${page.url}:`, (err as Error).message);
    }
  }

  // ── 3. Report ────────────────────────────────────────────────────────────────
  const report = buildReport(auditResults);
  const formatted = formatReport(report, format);

  if (output) {
    const { writeFile } = await import('fs/promises');
    try {
      await writeFile(output, formatted, 'utf8');
      if (!quiet) {
        console.log(`📄  Report written to: ${output}`);
      }
    } catch (err) {
      console.error('❌  Failed to write report:', (err as Error).message);
      process.exit(1);
    }
  } else {
    // Print to stdout
    process.stdout.write(formatted + '\n');
  }

  // Exit with a non-zero code when violations were found so CI pipelines can
  // detect failures automatically.
  const totalViolations = report.summary.totalViolations;
  if (totalViolations > 0) {
    if (!quiet) {
      console.error(`\n⚠️   ${totalViolations} accessibility violation(s) found.`);
    }
    process.exit(2);
  }

  if (!quiet) {
    console.log('\n🎉  No accessibility violations found!');
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
