import { existsSync, renameSync, rmSync, statSync } from 'node:fs';

export const DEFAULT_LOG_ROTATE_BYTES = 5 * 1024 * 1024;

export function getRotatedLogPath(filePath) {
  return /\.log$/i.test(filePath) ? filePath.replace(/\.log$/i, '.old.log') : `${filePath}.old`;
}

export function rotateLogFile(filePath, maxBytes = DEFAULT_LOG_ROTATE_BYTES) {
  try {
    if (!existsSync(filePath)) return false;
    if (statSync(filePath).size <= maxBytes) return false;
    const rotatedPath = getRotatedLogPath(filePath);
    rmSync(rotatedPath, { force: true });
    renameSync(filePath, rotatedPath);
    return true;
  } catch {
    return false;
  }
}
