import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  normalizeCollectionName,
  normalizeItemsArray,
  normalizeModelRequestInput,
} = require('./ipcValidation.cjs') as typeof import('./ipcValidation.cjs');

describe('ipcValidation', () => {
  it('accepts only known database collection names', () => {
    expect(normalizeCollectionName('materials')).toBe('materials');
    expect(normalizeCollectionName('unknown')).toBeNull();
  });

  it('coerces collection writes to arrays', () => {
    expect(normalizeItemsArray([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(normalizeItemsArray({ id: 1 })).toEqual([]);
  });

  it('rejects non-HTTPS model endpoints', () => {
    expect(normalizeModelRequestInput({ endpoint: 'http://example.test', headers: {}, body: '{}' })).toEqual({
      ok: false,
      message: 'Only HTTPS model endpoints are allowed.',
    });
  });

  it('normalizes valid model requests', () => {
    expect(normalizeModelRequestInput({
      endpoint: 'https://example.test/v1/chat/completions',
      headers: { Authorization: 'Bearer token' },
      body: { hello: 'world' },
    })).toEqual({
      ok: true,
      endpoint: 'https://example.test/v1/chat/completions',
      headers: { Authorization: 'Bearer token' },
      body: '{"hello":"world"}',
    });
  });
});

