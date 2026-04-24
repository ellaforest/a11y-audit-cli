import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { CrawlOptions, CrawlResult, CrawlerStats } from './types';

export class Crawler {
  private visited = new Set<string>();
  private queue: string[] = [];
  private results: CrawlResult[] = [];
  private failedPages = 0;

  constructor(private options: CrawlOptions) {
    this.options = {
      maxDepth: 3,
      maxPages: 50,
      timeout: 10000,
      followExternalLinks: false,
      ...options,
    };
  }

  async crawl(): Promise<{ results: CrawlResult[]; stats: CrawlerStats }> {
    const startTime = Date.now();
    const baseUrl = new URL(this.options.url);
    this.queue.push(this.options.url);

    while (
      this.queue.length > 0 &&
      this.results.length < (this.options.maxPages ?? 50)
    ) {
      const url = this.queue.shift()!;
      if (this.visited.has(url)) continue;
      this.visited.add(url);

      try {
        const result = await this.fetchPage(url);
        this.results.push(result);

        const newLinks = result.links.filter((link) => {
          if (this.visited.has(link)) return false;
          if (!this.options.followExternalLinks) {
            const linkUrl = new URL(link);
            return linkUrl.hostname === baseUrl.hostname;
          }
          return true;
        });

        this.queue.push(...newLinks);
      } catch {
        this.failedPages++;
      }
    }

    return {
      results: this.results,
      stats: {
        totalPages: this.results.length,
        failedPages: this.failedPages,
        durationMs: Date.now() - startTime,
      },
    };
  }

  private async fetchPage(url: string): Promise<CrawlResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const response = await fetch(url, { signal: controller.signal as any });
      const html = await response.text();
      const links = this.extractLinks(html, url);

      return {
        url,
        status: response.status,
        html,
        links,
        crawledAt: new Date(),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private extractLinks(html: string, baseUrl: string): string[] {
    const dom = new JSDOM(html, { url: baseUrl });
    const anchors = dom.window.document.querySelectorAll('a[href]');
    const links: string[] = [];

    anchors.forEach((anchor) => {
      try {
        const href = (anchor as HTMLAnchorElement).href;
        const url = new URL(href, baseUrl);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          links.push(url.href.split('#')[0]);
        }
      } catch {
        // ignore invalid URLs
      }
    });

    return [...new Set(links)];
  }
}
