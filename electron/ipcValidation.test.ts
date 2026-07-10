import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { normalizeDatabaseDataDir, normalizeCollectionName, normalizeItemsArray, normalizeModelRequestInput } =
  require('./ipcValidation.cjs') as typeof import('./ipcValidation.cjs');

describe('ipcValidation', () => {
  it('accepts only known database collection names', () => {
    expect(normalizeCollectionName('materials')).toBe('materials');
    expect(normalizeCollectionName('moonfallSettings')).toBe('moonfallSettings');
    expect(normalizeCollectionName('unknown')).toBeNull();
  });

  it('coerces collection writes to arrays', () => {
    expect(normalizeItemsArray([{ id: 1 }])).toEqual([{ id: 1 }]);
    expect(normalizeItemsArray({ id: 1 })).toEqual([]);
  });

  it('normalizes database data directories to absolute paths', () => {
    expect(normalizeDatabaseDataDir('', 'E:\\0yuexia\\0,月下PC\\shujuku')).toEqual({
      ok: true,
      dataDir: 'E:\\0yuexia\\0,月下PC\\shujuku',
    });
    expect(normalizeDatabaseDataDir('E:\\0yuexia\\0,月下PC\\shujuku\\..\\shujuku', 'E:\\fallback')).toEqual({
      ok: true,
      dataDir: 'E:\\0yuexia\\0,月下PC\\shujuku',
    });
  });

  it('rejects relative database data directories', () => {
    expect(normalizeDatabaseDataDir('..\\outside', 'E:\\0yuexia\\0,月下PC\\shujuku')).toEqual({
      ok: false,
      message: 'Database data directory must be an absolute path.',
    });
    expect(normalizeDatabaseDataDir('shujuku', 'E:\\0yuexia\\0,月下PC\\shujuku')).toEqual({
      ok: false,
      message: 'Database data directory must be an absolute path.',
    });
  });

  it('rejects non-HTTPS model endpoints', () => {
    expect(normalizeModelRequestInput({ endpoint: 'http://example.test', headers: {}, body: '{}' })).toEqual({
      ok: false,
      message: 'Only HTTPS model endpoints are allowed.',
    });
  });

  it('rejects malformed model endpoints and endpoints with credentials', () => {
    expect(normalizeModelRequestInput({ endpoint: 'https://', headers: {}, body: '{}' })).toEqual({
      ok: false,
      message: 'Model endpoint must be a valid HTTPS URL.',
    });
    expect(
      normalizeModelRequestInput({ endpoint: 'https://user:pass@example.test/v1', headers: {}, body: '{}' }),
    ).toEqual({
      ok: false,
      message: 'Model endpoint must not include credentials.',
    });
  });

  it('filters model request headers and rejects oversized bodies', () => {
    expect(
      normalizeModelRequestInput({
        endpoint: 'https://example.test/v1/chat/completions',
        headers: {
          Authorization: 'Bearer token',
          Cookie: 'secret',
          'x-api-key': 'key',
          'X-Unsafe': 'nope',
        },
        body: '{}',
      }),
    ).toEqual({
      ok: true,
      endpoint: 'https://example.test/v1/chat/completions',
      headers: {
        Authorization: 'Bearer token',
        'x-api-key': 'key',
      },
      body: '{}',
    });

    expect(
      normalizeModelRequestInput({
        endpoint: 'https://example.test/v1/chat/completions',
        headers: {},
        body: 'x'.repeat(4 * 1024 * 1024 + 1),
      }),
    ).toEqual({
      ok: false,
      message: 'Model request body is too large.',
    });
  });

  it('normalizes valid model requests', () => {
    expect(
      normalizeModelRequestInput({
        endpoint: 'https://example.test/v1/chat/completions',
        headers: { Authorization: 'Bearer token' },
        body: { hello: 'world' },
      }),
    ).toEqual({
      ok: true,
      endpoint: 'https://example.test/v1/chat/completions',
      headers: { Authorization: 'Bearer token' },
      body: '{"hello":"world"}',
    });
  });
});
