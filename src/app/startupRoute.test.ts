import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { APP_ROUTE_PATHS, STARTUP_ROUTE_PATH } from './routeRegistry';
import { getDevServerFingerprint } from '../../scripts/devServerFingerprint.mjs';

const repoRoot = process.cwd();

const readSource = (relativePath: string) => readFileSync(join(repoRoot, relativePath), 'utf8');

describe('startup routing', () => {
  it('opens the novel library instead of the removed dashboard page', () => {
    const app = readSource('src/app/App.tsx');
    const tabs = readSource('src/shared/tabs/WorkspaceTabsContext.tsx');
    const electronMain = readSource('electron/main.cjs');
    const launcher = readSource('launch-xinyuexia.mjs');

    expect(STARTUP_ROUTE_PATH).toBe('/novels');
    expect(APP_ROUTE_PATHS.novels).toBe(STARTUP_ROUTE_PATH);
    expect(app).toContainSource('<Route path="/" element={<Navigate to={STARTUP_ROUTE_PATH} replace />} />');
    expect(app).toContainSource('<Route path="*" element={<Navigate to={STARTUP_ROUTE_PATH} replace />} />');
    expect(app).toContainSource('window.location.hash = `#${STARTUP_ROUTE_PATH}`;');
    expect(app).not.toContainSource('@/pages/DashboardPage');
    expect(app).not.toContainSource('path="/dashboard"');

    expect(tabs).toContainSource("path: '/novels'");
    expect(tabs).not.toContainSource("path: '/dashboard'");

    expect(electronMain).toContainSource('#/novels');
    expect(electronMain).not.toContainSource('#/dashboard');
    expect(launcher).toContainSource('#/novels');
    expect(launcher).not.toContainSource('#/dashboard');
  });

  it('restarts the project Vite process when source or dependency inputs change', () => {
    const launcher = readSource('launch-xinyuexia.mjs');
    const fingerprintHelper = readSource('scripts/devServerFingerprint.mjs');

    expect(launcher).toContainSource("const devServerFingerprintFile = path.join(root, '.dev-server-fingerprint')");
    expect(launcher).toContainSource('getDevServerFingerprint');
    expect(launcher).toContainSource('isDevServerFingerprintCurrent');
    expect(launcher).toContainSource('dev server source/dependency fingerprint changed; restarting');
    expect(launcher).toContainSource('cleanupProjectViteProcesses');
    expect(launcher).toContainSource('writeDevServerFingerprint');
    expect(fingerprintHelper).toContainSource("'config/app-routes.json'");
    expect(fingerprintHelper).toContainSource("relativeDirectory = 'src'");
    expect(fingerprintHelper).toContainSource("readdirSync(absoluteDirectory, { withFileTypes: true })");
    expect(fingerprintHelper).toContainSource(".sort((left, right) => left.localeCompare(right))");
    expect(fingerprintHelper).toContainSource('readFileSync(filePath)');
    expect(launcher).toContainSource("import { inspectViteOptimizedDeps } from './scripts/viteOptimizedDepsHealth.mjs'");
    expect(launcher).toContainSource("const viteOptimizedDepsDir = path.join(root, 'node_modules', '.vite')");
    expect(launcher).toContainSource('fingerprintCurrent && (await areOptimizedDepsHealthy())');
    expect(launcher).toContainSource('dev server ready but optimized deps are stale; restarting');
    expect(launcher).toContainSource('removeIfExists(viteOptimizedDepsDir)');
    expect(launcher).toContainSource(
      "const electronInstaller = path.join(root, 'node_modules', 'electron', 'install.js')",
    );
    expect(launcher).toContainSource('Electron runtime missing; running installer');
    expect(launcher).toContainSource('ELECTRON_MIRROR: electronMirror');
  });

  it('changes the dev server fingerprint for source edits, additions, and deletions', () => {
    const fixtureRoot = join(tmpdir(), `moonxia-dev-fingerprint-${process.pid}-${Date.now()}`);
    const sourceDirectory = join(fixtureRoot, 'src');
    const configDirectory = join(fixtureRoot, 'config');
    mkdirSync(sourceDirectory, { recursive: true });
    mkdirSync(configDirectory, { recursive: true });

    try {
      writeFileSync(join(fixtureRoot, 'package.json'), '{}');
      writeFileSync(join(fixtureRoot, 'package-lock.json'), '{}');
      writeFileSync(join(fixtureRoot, 'vite.config.ts'), 'export default {}');
      writeFileSync(join(configDirectory, 'app-routes.json'), '{}');
      const pagePath = join(sourceDirectory, 'Page.tsx');
      writeFileSync(pagePath, 'export const Page = () => null;');
      const initialFingerprint = getDevServerFingerprint(fixtureRoot);

      writeFileSync(pagePath, 'export const Page = () => <main />;');
      const editedFingerprint = getDevServerFingerprint(fixtureRoot);
      expect(editedFingerprint).not.toBe(initialFingerprint);

      const addedPath = join(sourceDirectory, 'AddedPage.tsx');
      writeFileSync(addedPath, 'export const AddedPage = () => null;');
      const addedFingerprint = getDevServerFingerprint(fixtureRoot);
      expect(addedFingerprint).not.toBe(editedFingerprint);

      rmSync(addedPath);
      expect(getDevServerFingerprint(fixtureRoot)).toBe(editedFingerprint);

      writeFileSync(join(fixtureRoot, 'dist-output.js'), 'ignored');
      expect(getDevServerFingerprint(fixtureRoot)).toBe(editedFingerprint);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });
});
