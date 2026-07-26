const fs = require('node:fs');
const path = require('node:path');

const ROOTS = ['src', 'electron', 'scripts'].map((directory) => path.resolve(directory));
const WARN_LINES = 1000;
const HARD_LIMIT = 1000;
const TEST_HARD_LIMIT = 1000;
const PART_HARD_LIMIT = 1000;
const TRANSITION_LIMIT_OVERRIDES = [
  ['src/features/workbench/components/WorkbenchLibraryPanel.tsx', 4279],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase3.tsx', 1152],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase4.tsx', 1181],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase5.tsx', 1228],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase6.tsx', 1314],
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function isAutomatedTestFile(file) {
  return /\.(?:test|spec)\.(?:ts|tsx|js|jsx|cjs|mjs)$/.test(file);
}

const rows = ROOTS.flatMap((root) => walk(root))
  .filter((file) => /\.(?:ts|tsx|js|jsx|cjs|mjs|css)$/.test(file))
  .map((file) => ({
    file: path.relative(process.cwd(), file).replaceAll('\\', '/'),
    lines: fs.readFileSync(file, 'utf8').split(/\r?\n/).length,
  }))
  .filter((row) => row.lines > WARN_LINES)
  .sort((left, right) => right.lines - left.lines);

if (rows.length) {
  console.log(`Source size audit (>${WARN_LINES} lines):`);
  for (const row of rows) console.log(`${String(row.lines).padStart(5)}  ${row.file}`);
}

const violations = rows.filter((row) => {
  const override = TRANSITION_LIMIT_OVERRIDES.find(([file]) => file === row.file)?.[1];
  const limit =
    override ?? (row.file === 'electron/main.cjs' || isAutomatedTestFile(row.file) ? TEST_HARD_LIMIT : HARD_LIMIT);
  return row.lines > limit;
});
const generatedViolations = rows.filter(
  (row) =>
    /(?:\.generated\.|\.part-\d+\.|[\\/]styles[\\/]parts[\\/])/.test(row.file)
    && row.lines > PART_HARD_LIMIT,
);
if (violations.length || generatedViolations.length) {
  if (violations.length)
    console.error(
      `\n${violations.length} source files exceed their completion limit (ordinary: ${HARD_LIMIT}; automated tests and electron/main.cjs: ${TEST_HARD_LIMIT}).`,
    );
  if (generatedViolations.length)
    console.error(
      `${generatedViolations.length} generated/style parts exceed the ${PART_HARD_LIMIT}-line part limit.`,
    );
  process.exitCode = 1;
}
