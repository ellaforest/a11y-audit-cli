import { Crawler } from './crawler';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const makeResponse = (html: string, status = 200) =>
  ({
    status,
    text: async () => html,
  } as any);

const sampleHtml = `
  <html>
    <body>
      <a href="http://example.com/about">About</a>
      <a href="http://example.com/contact">Contact</a>
      <a href="https://external.com">External</a>
    </body>
  </html>
`;

describe('Crawler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crawls the initial URL', async () => {
    mockFetch.mockResolvedValue(makeResponse(sampleHtml));

    const crawler = new Crawler({ url: 'http://example.com', maxPages: 1 });
    const { results, stats } = await crawler.crawl();

    expect(results).toHaveLength(1);
    expect(results[0].url).toBe('http://example.com');
    expect(results[0].status).toBe(200);
    expect(stats.totalPages).toBe(1);
  });

  it('extracts internal links and follows them', async () => {
    mockFetch.mockResolvedValue(makeResponse(sampleHtml));

    const crawler = new Crawler({ url: 'http://example.com', maxPages: 3 });
    const { results } = await crawler.crawl();

    const urls = results.map((r) => r.url);
    expect(urls).toContain('http://example.com');
    expect(urls).toContain('http://example.com/about');
    expect(urls).not.toContain('https://external.com');
  });

  it('respects maxPages limit', async () => {
    mockFetch.mockResolvedValue(makeResponse(sampleHtml));

    const crawler = new Crawler({ url: 'http://example.com', maxPages: 2 });
    const { results } = await crawler.crawl();

    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('tracks failed pages', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const crawler = new Crawler({ url: 'http://example.com', maxPages: 1 });
    const { stats } = await crawler.crawl();

    expect(stats.failedPages).toBe(1);
    expect(stats.totalPages).toBe(0);
  });
});
