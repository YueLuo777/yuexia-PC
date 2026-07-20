const { spawnSync } = require('node:child_process');

const eslint = spawnSync(process.execPath, ['node_modules/eslint/bin/eslint.js', '.'], {
  encoding: 'utf8',
  shell: false,
});
const output = `${eslint.stdout ?? ''}${eslint.stderr ?? ''}`;
process.stdout.write(output);
if (eslint.error) {
  console.error(eslint.error.message);
  process.exit(1);
}
if (eslint.status !== 0) process.exit(eslint.status ?? 1);

const hookWarnings = (output.match(/react-hooks\/exhaustive-deps/g) ?? []).length;
const gate = spawnSync(process.execPath, ['scripts/check-refactor-debt.cjs'], {
  encoding: 'utf8',
  shell: false,
  env: { ...process.env, XINYUEXIA_HOOK_WARNING_COUNT: String(hookWarnings) },
});
process.stdout.write(gate.stdout ?? '');
process.stderr.write(gate.stderr ?? '');
process.exit(gate.status ?? 1);
