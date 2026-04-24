export interface CrawlOptions {
  url: string;
  maxDepth?: number;
  maxPages?: number;
  timeout?: number;
  followExternalLinks?: boolean;
}

export interface CrawlResult {
  url: string;
  status: number;
  html: string;
  links: string[];
  crawledAt: Date;
}

export interface CrawlerStats {
  totalPages: number;
  failedPages: number;
  durationMs: number;
}
