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

  it('shows the fetch status inside the empty hotspot list instead of hiding it at the bottom', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContain('status || \'暂无热点，点击刷新重试。\'');
    expect(page).toContain('filteredItems.length === 0');
  });

  it('uses the radar layout with one third hotspot list and two thirds AI suitability panel', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContain('SourceRadar');
    expect(page).toContain('grid-cols-[minmax(260px,1fr)_minmax(520px,2fr)]');
    expect(page).toContain('AI 小说适合度');
    expect(page).not.toContain('<SourceFilter');
  });

  it('uses a dedicated hotspot model selector instead of the global active model', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContain('HOTSPOT_MODEL_ID_STORAGE_KEY');
    expect(page).toContain('HotspotModelSelect');
    expect(page).toContain('const hotspotModel =');
    expect(page).toContain('model: hotspotModel');
    expect(page).not.toContain('model: activeModel');
  });
});
