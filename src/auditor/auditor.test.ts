import { Auditor } from './auditor';
import { getWcagReference } from './wcag-map';
import { AuditResult } from './types';

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue(null),
      setDefaultTimeout: jest.fn(),
      close: jest.fn(),
    }),
    close: jest.fn(),
  }),
}));

jest.mock('@axe-core/puppeteer', () => ({
  AxePuppeteer: jest.fn().mockImplementation(() => ({
    withRules: jest.fn().mockReturnThis(),
    analyze: jest.fn().mockResolvedValue({
      violations: [
        {
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternate text',
          help: 'Images must have alternate text',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
          nodes: [
            {
              html: '<img src="logo.png">',
              target: ['img'],
              failureSummary: 'Fix any of the following: Element does not have an alt attribute',
            },
          ],
        },
      ],
      passes: [{}, {}],
      incomplete: [{}],
      inapplicable: [],
    }),
  })),
}));

describe('Auditor', () => {
  let auditor: Auditor;

  beforeEach(async () => {
    auditor = new Auditor({ wcagLevel: 'AA', timeout: 10000 });
    await auditor.init();
  });

  afterEach(async () => {
    await auditor.close();
  });

  it('should return an AuditResult with violations', async () => {
    const result: AuditResult = await auditor.auditUrl('http://example.com');
    expect(result.url).toBe('http://example.com');
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].id).toBe('image-alt');
    expect(result.violations[0].impact).toBe('critical');
    expect(result.passes).toBe(2);
    expect(result.incomplete).toBe(1);
    expect(result.inapplicable).toBe(0);
  });

  it('should attach WCAG references to known violations', async () => {
    const result = await auditor.auditUrl('http://example.com');
    expect(result.violations[0].wcag).toHaveLength(1);
    expect(result.violations[0].wcag[0].criterion).toBe('1.1.1');
  });

  it('should throw if auditUrl is called before init', async () => {
    const uninitializedAuditor = new Auditor();
    await expect(uninitializedAuditor.auditUrl('http://example.com')).rejects.toThrow(
      'Auditor not initialized'
    );
  });
});

describe('getWcagReference', () => {
  it('should return a reference for a known rule', () => {
    const ref = getWcagReference('color-contrast');
    expect(ref).not.toBeNull();
    expect(ref?.criterion).toBe('1.4.3');
    expect(ref?.level).toBe('AA');
  });

  it('should return null for an unknown rule', () => {
    const ref = getWcagReference('unknown-rule');
    expect(ref).toBeNull();
  });
});
