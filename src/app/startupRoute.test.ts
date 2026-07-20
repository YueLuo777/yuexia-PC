import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { APP_ROUTE_PATHS, STARTUP_ROUTE_PATH } from './routeRegistry';

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

  it('restarts the project Vite process when dependency inputs change', () => {
    const launcher = readSource('launch-xinyuexia.mjs');

    expect(launcher).toContainSource("import { createHash } from 'node:crypto'");
    expect(launcher).toContainSource("const devServerFingerprintFile = path.join(root, '.dev-server-fingerprint')");
    expect(launcher).toContainSource('getDevServerFingerprint');
    expect(launcher).toContainSource('isDevServerFingerprintCurrent');
    expect(launcher).toContainSource('dev server dependency fingerprint changed; restarting');
    expect(launcher).toContainSource('cleanupProjectViteProcesses');
    expect(launcher).toContainSource('writeDevServerFingerprint');
    expect(launcher).toContainSource(
      "const electronInstaller = path.join(root, 'node_modules', 'electron', 'install.js')",
    );
    expect(launcher).toContainSource('Electron runtime missing; running installer');
    expect(launcher).toContainSource('ELECTRON_MIRROR: electronMirror');
  });
});
