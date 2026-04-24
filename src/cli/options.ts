import { ImpactLevel, FilterOptions } from '../reporter/filter';

export interface CliOptions {
  url: string;
  depth: number;
  format: 'json' | 'text' | 'csv';
  output?: string;
  impact?: ImpactLevel[];
  wcagLevel?: string[];
  ruleIds?: string[];
  urlPattern?: string;
  sortByImpact: boolean;
  timeout: number;
  verbose: boolean;
}

const VALID_FORMATS = ['json', 'text', 'csv'] as const;
const VALID_IMPACTS: ImpactLevel[] = ['minor', 'moderate', 'serious', 'critical'];

export function parseCliOptions(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const getAll = (flag: string): string[] => {
    const results: string[] = [];
    args.forEach((arg, i) => {
      if (arg === flag && args[i + 1]) results.push(args[i + 1]);
    });
    return results;
  };
  const has = (flag: string): boolean => args.includes(flag);

  const url = get('--url') ?? get('-u') ?? '';
  if (!url) throw new Error('--url is required');

  const formatRaw = get('--format') ?? get('-f') ?? 'text';
  if (!VALID_FORMATS.includes(formatRaw as any)) {
    throw new Error(`Invalid format: ${formatRaw}. Must be one of: ${VALID_FORMATS.join(', ')}`);
  }

  const impactRaw = getAll('--impact');
  const impact = impactRaw.length > 0
    ? impactRaw.filter((i): i is ImpactLevel => VALID_IMPACTS.includes(i as ImpactLevel))
    : undefined;

  return {
    url,
    depth: parseInt(get('--depth') ?? get('-d') ?? '2', 10),
    format: formatRaw as 'json' | 'text' | 'csv',
    output: get('--output') ?? get('-o'),
    impact: impact && impact.length > 0 ? impact : undefined,
    wcagLevel: getAll('--wcag-level').length > 0 ? getAll('--wcag-level') : undefined,
    ruleIds: getAll('--rule').length > 0 ? getAll('--rule') : undefined,
    urlPattern: get('--url-pattern'),
    sortByImpact: has('--sort-by-impact'),
    timeout: parseInt(get('--timeout') ?? '30000', 10),
    verbose: has('--verbose') || has('-v'),
  };
}

export function buildFilterOptions(opts: CliOptions): FilterOptions | undefined {
  const filter: FilterOptions = {};
  if (opts.impact) filter.impact = opts.impact;
  if (opts.wcagLevel) filter.wcagLevels = opts.wcagLevel;
  if (opts.ruleIds) filter.ruleIds = opts.ruleIds;
  if (opts.urlPattern) filter.urlPattern = opts.urlPattern;
  return Object.keys(filter).length > 0 ? filter : undefined;
}
