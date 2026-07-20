const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve('src');
const ALLOWED_SCOPE_ADAPTERS = new Set([
  'src/features/tests/pages/SoftwareUiCatalogPageView.tsx',
  'src/features/tests/pages/TomatoGenreIterationTestPageView.tsx',
  'src/features/workbench/components/ChapterEditorView.tsx',
  'src/features/workbench/components/OutlineWorkspaceView.tsx',
  'src/features/workbench/components/WorkbenchAIPanelView.tsx',
  'src/features/workbench/components/createOutlineControllerPhase1.tsx',
  'src/features/workbench/components/createOutlineControllerPhase2.tsx',
  'src/features/workbench/components/createOutlineControllerPhase3.tsx',
  'src/features/workbench/components/workbenchOutlineLibraryBranch.tsx',
  'src/features/workbench/components/workbenchSettingLibraryBranch.tsx',
  'src/features/workbench/components/workbenchSettingLibraryView.tsx',
  'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase1.tsx',
  'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase2.tsx',
  'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase3.tsx',
  'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase4.tsx',
  'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase5.tsx',
  'src/features/workbench/hooks/useWorkbenchLibraryControllerPhase6.tsx',
  'src/shared/layout/AppFrameView.tsx',
]);
const ALLOWED_HOOK_WARNINGS = 0;
const RETIRED_RUNTIME_TOKENS = [
  'HotspotPage',
  'HotspotBridge',
  'xinyuexiaHotspots',
  'hotspots:fetch',
  'HOTSPOT_',
  'PlotLibraryPage',
  'PlotLibraryParts',
  'PlotLibraryPageView',
  'PlotClearConfirmModal',
  'PlotDetailModal',
  'PlotExportModal',
  'PlotImportModals',
  'moonfallSettingPersistence',
  'moonfallSettingStore',
  'moonfallRetrieval',
  'moonfallImportPipeline',
  'workbenchPlotChain',
  'workbenchPlotPoint',
  'plotPointStandalone',
  'xinyuexia_plot_library_v1',
  'TextOverridesPage',
  'TextOverrideLayer',
  'textOverrideStore',
  'toggle_text_edit_mode',
  'associationMemory',
  'IconButton',
  'CapsuleActionGroup',
  'useUiPreference',
  'SettingsPageSchemeOneBackup',
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const sources = walk(ROOT)
  .filter((file) => /\.(?:ts|tsx)$/.test(file) && !/\.test\.|\.cases-\d+\./.test(file))
  .map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }));
const relativePath = (file) => path.relative(process.cwd(), file).replaceAll('\\', '/');
const tsNocheck = sources
  .filter(({ source }) => /^\s*\/\/\s*@ts-nocheck\b/m.test(source))
  .map(({ file }) => relativePath(file));
const recordAny = sources
  .filter(({ source }) => /Record\s*<\s*string\s*,\s*any\s*>/.test(source))
  .map(({ file }) => relativePath(file));
const unexpectedTsNocheck = tsNocheck.filter((file) => !ALLOWED_SCOPE_ADAPTERS.has(file));
const unexpectedRecordAny = recordAny.filter((file) => !ALLOWED_SCOPE_ADAPTERS.has(file));
const staleAllowlist = [...ALLOWED_SCOPE_ADAPTERS].filter(
  (file) => !tsNocheck.includes(file) || !recordAny.includes(file),
);
const runtimeSources = [
  ...sources,
  ...walk(path.resolve('electron'))
    .filter((file) => /\.(?:cjs|mjs|js)$/.test(file))
    .map((file) => ({ file, source: fs.readFileSync(file, 'utf8') })),
].filter(
  ({ file }) => !/\.test\.|\.cases-\d+\./.test(file) && !file.includes(`${path.sep}features${path.sep}tests${path.sep}`),
);
const retiredRuntimeReferences = runtimeSources.flatMap(({ file, source }) =>
  RETIRED_RUNTIME_TOKENS.filter((token) => source.includes(token)).map((token) => `${relativePath(file)} -> ${token}`),
);

let hookWarnings = 0;
if (process.env.XINYUEXIA_HOOK_WARNING_COUNT) hookWarnings = Number(process.env.XINYUEXIA_HOOK_WARNING_COUNT);

const checks = [['Hook dependency warnings', hookWarnings, ALLOWED_HOOK_WARNINGS]];

console.log(`Explicit legacy scope adapters: ${tsNocheck.length}/${ALLOWED_SCOPE_ADAPTERS.size}`);
console.log(`Retired runtime references: ${retiredRuntimeReferences.length}/0`);
for (const [label, actual, limit] of checks) console.log(`${label}: ${actual}/${limit}`);
const violations = checks.filter(([, actual, limit]) => actual > limit);
if (
  violations.length ||
  unexpectedTsNocheck.length ||
  unexpectedRecordAny.length ||
  staleAllowlist.length ||
  retiredRuntimeReferences.length
) {
  if (unexpectedTsNocheck.length) console.error(`Unexpected @ts-nocheck files: ${unexpectedTsNocheck.join(', ')}`);
  if (unexpectedRecordAny.length)
    console.error(`Unexpected Record<string, any> files: ${unexpectedRecordAny.join(', ')}`);
  if (staleAllowlist.length)
    console.error(`Remove resolved files from the scope-adapter allowlist: ${staleAllowlist.join(', ')}`);
  if (retiredRuntimeReferences.length)
    console.error(`Retired runtime references: ${retiredRuntimeReferences.join(', ')}`);
  console.error('\nRefactor debt increased. Reduce the new debt or deliberately lower the baseline after cleanup.');
  process.exitCode = 1;
}
