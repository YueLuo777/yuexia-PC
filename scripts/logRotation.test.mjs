import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getRotatedLogPath, rotateLogFile } from './logRotation.mjs';

describe('logRotation', () => {
  it('rotates oversized log files to .old.log', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'xinyuexia-log-'));
    try {
      const logPath = path.join(dir, 'electron-dev.log');
      const rotatedPath = getRotatedLogPath(logPath);
      writeFileSync(logPath, 'current log content');
      writeFileSync(rotatedPath, 'old content');

      expect(rotateLogFile(logPath, 4)).toBe(true);
      expect(readFileSync(rotatedPath, 'utf8')).toBe('current log content');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('keeps small log files in place', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'xinyuexia-log-'));
    try {
      const logPath = path.join(dir, 'launcher.log');
      writeFileSync(logPath, 'small');

      expect(rotateLogFile(logPath, 100)).toBe(false);
      expect(readFileSync(logPath, 'utf8')).toBe('small');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
