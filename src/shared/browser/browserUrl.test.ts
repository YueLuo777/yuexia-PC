import { describe, expect, it } from 'vitest';

import { getBrowserHostLabel, isMobileOptimizedBrowserUrl, normalizeBrowserUrl } from './browserUrl';

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
});
