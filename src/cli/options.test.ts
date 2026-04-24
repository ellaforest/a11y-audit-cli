import { parseCliOptions, buildFilterOptions } from './options';

const base = ['node', 'cli.js'];

describe('parseCliOptions', () => {
  it('parses required --url flag', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com']);
    expect(opts.url).toBe('http://example.com');
  });

  it('throws if --url is missing', () => {
    expect(() => parseCliOptions([...base])).toThrow('--url is required');
  });

  it('parses --format flag', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com', '--format', 'csv']);
    expect(opts.format).toBe('csv');
  });

  it('throws on invalid format', () => {
    expect(() =>
      parseCliOptions([...base, '--url', 'http://example.com', '--format', 'xml'])
    ).toThrow('Invalid format');
  });

  it('parses --depth flag', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com', '--depth', '5']);
    expect(opts.depth).toBe(5);
  });

  it('defaults depth to 2', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com']);
    expect(opts.depth).toBe(2);
  });

  it('parses multiple --impact flags', () => {
    const opts = parseCliOptions([
      ...base, '--url', 'http://example.com',
      '--impact', 'serious', '--impact', 'critical',
    ]);
    expect(opts.impact).toEqual(['serious', 'critical']);
  });

  it('parses --sort-by-impact flag', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com', '--sort-by-impact']);
    expect(opts.sortByImpact).toBe(true);
  });

  it('parses --verbose flag', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com', '--verbose']);
    expect(opts.verbose).toBe(true);
  });

  it('parses --output flag', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com', '--output', './out.json']);
    expect(opts.output).toBe('./out.json');
  });
});

describe('buildFilterOptions', () => {
  it('returns undefined when no filter options set', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com']);
    expect(buildFilterOptions(opts)).toBeUndefined();
  });

  it('returns filter object when impact is set', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com', '--impact', 'critical']);
    const filter = buildFilterOptions(opts);
    expect(filter).toBeDefined();
    expect(filter?.impact).toEqual(['critical']);
  });

  it('includes urlPattern in filter', () => {
    const opts = parseCliOptions([...base, '--url', 'http://example.com', '--url-pattern', '/blog']);
    const filter = buildFilterOptions(opts);
    expect(filter?.urlPattern).toBe('/blog');
  });
});
