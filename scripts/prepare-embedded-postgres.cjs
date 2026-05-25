const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const targetRoot = path.join(repoRoot, 'runtime', 'postgres');
const explicitSource = process.argv[2] ? path.resolve(process.argv[2]) : '';

function executableName(name) {
  return process.platform === 'win32' ? `${name}.exe` : name;
}

function findInstalledPostgresRoot() {
  if (explicitSource) return explicitSource;
  const command = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(command, ['psql'], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) return '';
  const psqlPath = result.stdout.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  return psqlPath ? path.dirname(path.dirname(psqlPath)) : '';
}

function hasRequiredBinaries(root) {
  return ['postgres', 'initdb', 'pg_ctl', 'psql']
    .map((name) => path.join(root, 'bin', executableName(name)))
    .every((file) => fs.existsSync(file));
}

function shouldCopy(sourcePath) {
  const relative = path.relative(sourceRoot, sourcePath).replace(/\\/g, '/');
  const top = relative.split('/')[0]?.toLowerCase();
  if (!relative) return true;
  if (['data', 'log', 'logs', 'tmp', 'temp', 'pgadmin 4'].includes(top)) return false;
  if (relative.includes('/pg_wal/') || relative.includes('/pg_log/')) return false;
  return true;
}

const sourceRoot = findInstalledPostgresRoot();
if (!sourceRoot || !fs.existsSync(sourceRoot)) {
  console.error('Cannot find PostgreSQL. Pass its root path, for example: npm.cmd run prepare:postgres -- "C:\\Program Files\\PostgreSQL\\16"');
  process.exit(1);
}

if (!hasRequiredBinaries(sourceRoot)) {
  console.error(`Missing required PostgreSQL binaries under: ${sourceRoot}`);
  console.error('Expected bin/postgres, bin/initdb, bin/pg_ctl, and bin/psql.');
  process.exit(1);
}

if (path.resolve(sourceRoot) === path.resolve(targetRoot)) {
  console.log('PostgreSQL runtime is already in runtime/postgres.');
  process.exit(0);
}

fs.mkdirSync(targetRoot, { recursive: true });
fs.cpSync(sourceRoot, targetRoot, {
  recursive: true,
  force: true,
  filter: shouldCopy,
});

const readmePath = path.join(targetRoot, 'README.md');
if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, 'Embedded PostgreSQL runtime copied for 月下写作.\n', 'utf8');
}

console.log(`Copied PostgreSQL runtime from ${sourceRoot}`);
console.log(`Target: ${targetRoot}`);
