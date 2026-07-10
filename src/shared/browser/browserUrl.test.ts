import { describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getBrowserHostLabel,
  isEmbeddedBrowserEnabled,
  isMobileOptimizedBrowserUrl,
  normalizeBrowserUrl,
} from './browserUrl';

const readSource = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('browserUrl', () => {
  it('normalizes user-entered urls for the embedded browser', () => {
    expect(normalizeBrowserUrl('')).toBe('');
    expect(normalizeBrowserUrl(' qidian.com ')).toBe('https://qidian.com');
    expect(normalizeBrowserUrl('http://example.test/read')).toBe('http://example.test/read');
    expect(normalizeBrowserUrl('https://example.test/read')).toBe('https://example.test/read');
  });

  it('derives readable host labels', () => {
    expect(getBrowserHostLabel('https://www.qidian.com/book')).toBe('qidian.com');
    expect(getBrowserHostLabel('not a url with spaces')).toBe('not a url with spaces');
  });

  it('detects mobile optimized urls', () => {
    expect(isMobileOptimizedBrowserUrl('https://m.qidian.com/book')).toBe(true);
    expect(isMobileOptimizedBrowserUrl('https://www.qidian.com/book?force_mobile=1')).toBe(true);
    expect(isMobileOptimizedBrowserUrl('https://www.qidian.com/book')).toBe(false);
  });

  it('disables embedded webviews in normal production bundles', () => {
    expect(isEmbeddedBrowserEnabled({ DEV: true })).toBe(true);
    expect(isEmbeddedBrowserEnabled({ DEV: false })).toBe(false);
    expect(isEmbeddedBrowserEnabled({ DEV: false, VITE_ENABLE_EMBEDDED_BROWSER: '1' })).toBe(true);
  });

  it('does not expose the full Vite env object to production bundles', () => {
    const source = readSource('src/shared/browser/browserUrl.ts');

    expect(source).not.toContainSource('return import.meta.env;');
    expect(source).toContainSource('DEV: import.meta.env.DEV');
    expect(source).toContainSource('VITE_ENABLE_EMBEDDED_BROWSER: import.meta.env.VITE_ENABLE_EMBEDDED_BROWSER');
  });
});
