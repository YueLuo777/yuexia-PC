const fs = require('node:fs');
const path = require('node:path');

const SCAN_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.map', '.txt']);
const SECRET_PATTERNS = [
  {
    name: 'API key shaped token',
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    name: 'Bearer token',
    pattern: /\bBearer\s+[A-Za-z0-9._-]{20,}\b/g,
  },
  {
    name: 'Vite frontend secret variable',
    pattern: /\bVITE_[A-Z0-9_]*(?:API_KEY|SECRET|TOKEN|PASSWORD)\b/g,
  },
];

function listScanFiles(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) return listScanFiles(fullPath);
    if (!entry.isFile()) return [];
    return SCAN_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

function getLineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findSecretMatches(rootDir, patterns = SECRET_PATTERNS) {
  return listScanFiles(rootDir).flatMap((file) => {
    const text = fs.readFileSync(file, 'utf8');
    return patterns.flatMap(({ name, pattern }) => {
      pattern.lastIndex = 0;
      const matches = [];
      let match = pattern.exec(text);
      while (match) {
        matches.push({
          file,
          line: getLineNumber(text, match.index),
          patternName: name,
        });
        match = pattern.exec(text);
      }
      return matches;
    });
  });
}

function main() {
  const targetDir = path.resolve(process.argv[2] || 'dist');
  if (!fs.existsSync(targetDir)) {
    console.error(`Secret scan target does not exist: ${targetDir}`);
    process.exitCode = 1;
    return;
  }

  const matches = findSecretMatches(targetDir);
  if (matches.length === 0) {
    console.log(`No bundled secrets found in ${targetDir}.`);
    return;
  }

  console.error(`Bundled secret scan found ${matches.length} suspicious match(es):`);
  matches.forEach((match) => {
    console.error(`- ${path.relative(process.cwd(), match.file)}:${match.line} ${match.patternName}`);
  });
  process.exitCode = 1;
}

if (require.main === module) {
  main();
}

module.exports = {
  findSecretMatches,
  listScanFiles,
};
