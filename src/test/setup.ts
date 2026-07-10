import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';

function canonicalizeSourceText(value: string) {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/\s+/g, '')
    .replace(/,([}\])])/g, '$1')
    .replace(/,$/, '')
    .replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => hex.toLowerCase());
}

expect.extend({
  toContainSource(received: unknown, expected: unknown) {
    const pass =
      typeof received === 'string' && typeof expected === 'string'
        ? canonicalizeSourceText(received).includes(canonicalizeSourceText(expected))
        : Array.isArray(received)
          ? received.includes(expected)
          : false;
    return {
      pass,
      message: () =>
        pass
          ? 'expected source not to contain the canonicalized snippet'
          : 'expected source to contain the canonicalized snippet',
    };
  },
});

declare module 'vitest' {
  interface Assertion<T = any> {
    toContainSource(expected: unknown): T;
  }

  interface AsymmetricMatchersContaining {
    toContainSource(expected: unknown): unknown;
  }
}
