import { WCAGReference } from './types';

export const WCAG_MAP: Record<string, WCAGReference> = {
  'color-contrast': {
    criterion: '1.4.3',
    level: 'AA',
    description: 'Contrast (Minimum)',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
  },
  'image-alt': {
    criterion: '1.1.1',
    level: 'A',
    description: 'Non-text Content',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
  },
  'label': {
    criterion: '1.3.1',
    level: 'A',
    description: 'Info and Relationships',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
  },
  'link-name': {
    criterion: '2.4.4',
    level: 'A',
    description: 'Link Purpose (In Context)',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
  },
  'html-has-lang': {
    criterion: '3.1.1',
    level: 'A',
    description: 'Language of Page',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
  },
  'document-title': {
    criterion: '2.4.2',
    level: 'A',
    description: 'Page Titled',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html',
  },
  'keyboard': {
    criterion: '2.1.1',
    level: 'A',
    description: 'Keyboard',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
  },
};

export function getWcagReference(ruleId: string): WCAGReference | null {
  return WCAG_MAP[ruleId] ?? null;
}
