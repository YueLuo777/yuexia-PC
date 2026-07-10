import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { createModelSecretStore, normalizeSecretId } =
  require('./modelSecretStore.cjs') as typeof import('./modelSecretStore.cjs');

let tempDir = '';
let filePath = '';

const safeStorage = {
  isEncryptionAvailable: () => true,
  encryptString: (value: string) => Buffer.from(`encrypted:${value}`, 'utf8'),
  decryptString: (value: Buffer) => value.toString('utf8').replace(/^encrypted:/, ''),
};

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), 'xinyuexia-model-secret-test-'));
  filePath = path.join(tempDir, 'model-secrets.json');
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('modelSecretStore', () => {
  it('stores encrypted API keys and supports status, read and removal', async () => {
    const store = createModelSecretStore({ safeStorage, filePath });

    expect(store.set('model-instance-1', 'sk-private-value')).toEqual({ ok: true, hasSecret: true });
    expect(await readFile(filePath, 'utf8')).not.toContain('sk-private-value');
    expect(store.status()).toEqual({
      ok: true,
      encryptionAvailable: true,
      secrets: { 'model-instance-1': true },
    });
    expect(store.get('model-instance-1')).toEqual({ ok: true, apiKey: 'sk-private-value' });
    expect(store.remove('model-instance-1')).toEqual({ ok: true, hasSecret: false });
    expect(store.get('model-instance-1')).toEqual({ ok: false, apiKey: '', message: '模型 API Key 尚未保存。' });
  });

  it('rejects prototype keys and refuses plaintext fallback when encryption is unavailable', () => {
    expect(normalizeSecretId('__proto__')).toBe('');
    const store = createModelSecretStore({
      safeStorage: { ...safeStorage, isEncryptionAvailable: () => false },
      filePath,
    });
    expect(store.set('model-1', 'secret')).toEqual({ ok: false, message: '系统安全存储当前不可用。' });
  });
});
