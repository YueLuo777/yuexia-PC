const fs = require('node:fs');
const path = require('node:path');

const ROOTS = ['src', 'electron', 'scripts'].map((directory) => path.resolve(directory));
const WARN_LINES = 500;
const HARD_LIMIT = 700;
const TEST_HARD_LIMIT = 900;
const TRANSITION_LIMIT_OVERRIDES = [
  ['src/features/workbench/components/WorkbenchLibraryPanel.tsx', 4857],
  ['src/features/workbench/components/workbenchOutlineLibraryBranch.tsx', 1137],
  ['src/features/workbench/components/workbenchSettingLibraryBranch.tsx', 945],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase1.tsx', 1142],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase2.tsx', 725],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase3.tsx', 1247],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase4.tsx', 1277],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase5.tsx', 1322],
  ['src/features/workbench/hooks/useWorkbenchLibraryControllerPhase6.tsx', 1409],
  ['src/features/workbench/pages/WorkbenchPage.tsx', 805],
  ['src/features/tests/pages/SoftwareUiCatalogPageView.tsx', 803],
  ['src/features/workbench/components/OutlineWorkspaceView.tsx', 742],
  ['src/shared/layout/AppFrame.tsx', 710],
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
  console.log('Source size audit (>500 lines):');
  for (const row of rows) console.log(`${String(row.lines).padStart(5)}  ${row.file}`);
}

const violations = rows.filter((row) => {
  const override = TRANSITION_LIMIT_OVERRIDES.find(([file]) => file === row.file)?.[1];
  const limit =
    override ?? (row.file === 'electron/main.cjs' || isAutomatedTestFile(row.file) ? TEST_HARD_LIMIT : HARD_LIMIT);
  return row.lines > limit;
});
const generatedViolations = rows.filter(
  (row) => /(?:\.generated\.|\.part-\d+\.|[\\/]styles[\\/]parts[\\/])/.test(row.file) && row.lines > 500,
);
if (violations.length || generatedViolations.length) {
  if (violations.length)
    console.error(
      `\n${violations.length} source files exceed their completion limit (ordinary: ${HARD_LIMIT}; automated tests and electron/main.cjs: ${TEST_HARD_LIMIT}).`,
    );
  if (generatedViolations.length)
    console.error(`${generatedViolations.length} generated/style parts exceed the 500-line part limit.`);
  process.exitCode = 1;
}
