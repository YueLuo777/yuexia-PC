import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('hotspot page integration', () => {
  it('registers the hotspot page in app routes and default navigation', () => {
    const app = readSource('src/app/App.tsx');
    const nav = readSource('src/shared/navigation/navConfig.ts');

    expect(app).toContain("HotspotPage");
    expect(app).toContain('path="/hotspots"');
    expect(nav).toContain("to: '/hotspots'");
    expect(nav).toContain("label: '热点灵感'");
  });

  it('exposes hotspot fetching through the Electron preload bridge', () => {
    const preload = readSource('electron/preload.cjs');
    const main = readSource('electron/main.cjs');

    expect(preload).toContain("contextBridge.exposeInMainWorld('xinyuexiaHotspots'");
    expect(preload).toContain("ipcRenderer.invoke('hotspots:fetch-all'");
    expect(main).toContain("ipcMain.handle('hotspots:fetch-all'");
    expect(main).toContain('createHotspotService');
  });
});
