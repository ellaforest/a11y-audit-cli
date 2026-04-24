import puppeteer, { Browser, Page } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { AuditResult, AuditorOptions, Violation, ViolationNode } from './types';
import { getWcagReference } from './wcag-map';

export class Auditor {
  private browser: Browser | null = null;
  private options: AuditorOptions;

  constructor(options: AuditorOptions = {}) {
    this.options = {
      wcagLevel: 'AA',
      timeout: 30000,
      ...options,
    };
  }

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({ headless: true });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async auditUrl(url: string): Promise<AuditResult> {
    if (!this.browser) {
      throw new Error('Auditor not initialized. Call init() first.');
    }

    const page: Page = await this.browser.newPage();
    page.setDefaultTimeout(this.options.timeout ?? 30000);

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      const axe = new AxePuppeteer(page);
      if (this.options.rules?.length) {
        axe.withRules(this.options.rules);
      }

      const results = await axe.analyze();

      const violations: Violation[] = results.violations.map((v) => ({
        id: v.id,
        impact: (v.impact as Violation['impact']) ?? 'minor',
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        wcag: [getWcagReference(v.id)].filter(Boolean) as Violation['wcag'],
        nodes: v.nodes.map(
          (n): ViolationNode => ({
            html: n.html,
            target: n.target.map(String),
            failureSummary: n.failureSummary ?? '',
          })
        ),
      }));

      return {
        url,
        timestamp: new Date().toISOString(),
        violations,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
      };
    } finally {
      await page.close();
    }
  }
}
