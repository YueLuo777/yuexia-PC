import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { findSecretMatches } = require('./check-dist-secrets.cjs');

describe('check-dist-secrets', () => {
  it('finds bundled API key shaped strings', () => {
    const dir = mkdtempSync(join(tmpdir(), 'xinyuexia-secret-scan-'));
    try {
      writeFileSync(join(dir, 'app.js'), 'const key = "sk-testsecret12345678901234567890";');

      expect(findSecretMatches(dir)).toEqual([
        expect.objectContaining({
          file: expect.stringContaining('app.js'),
          patternName: 'API key shaped token',
        }),
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ignores normal bundled text', () => {
    const dir = mkdtempSync(join(tmpdir(), 'xinyuexia-secret-scan-'));
    try {
      writeFileSync(join(dir, 'app.js'), 'const title = "月下写作";');

      expect(findSecretMatches(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
