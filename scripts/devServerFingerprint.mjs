import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css']);
const fixedFingerprintFiles = ['package.json', 'package-lock.json', 'vite.config.ts', 'config/app-routes.json'];

function collectSourceFiles(root, relativeDirectory = 'src') {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];

  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .flatMap((entry) => {
      const relativePath = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name);
      if (entry.isDirectory()) return collectSourceFiles(root, relativePath);
      return entry.isFile() && sourceExtensions.has(path.extname(entry.name).toLowerCase()) ? [relativePath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

export function getDevServerFingerprint(root) {
  const hash = createHash('sha256');
  const fingerprintFiles = [...fixedFingerprintFiles, ...collectSourceFiles(root)].sort((left, right) =>
    left.localeCompare(right),
  );

  fingerprintFiles.forEach((relativePath) => {
    const normalizedPath = relativePath.replaceAll('\\', '/');
    const filePath = path.join(root, ...normalizedPath.split('/'));
    hash.update(`${normalizedPath}\0`);
    hash.update(existsSync(filePath) ? readFileSync(filePath) : 'missing');
    hash.update('\0');
  });

  return hash.digest('hex');
}

export const devServerFingerprintInputs = {
  fixedFiles: fixedFingerprintFiles,
  sourceExtensions: [...sourceExtensions],
};
