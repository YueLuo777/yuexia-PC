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
    expect(nav).toContain("label: '热点分析'");
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
    expect(page).toContain('HOTSPOT_PROMPT_ID_STORAGE_KEY');
    expect(page).toContain('HOTSPOT_ANALYSIS_PROMPT_CATEGORY');
    expect(page).toContain('const HOTSPOT_PROMPT_CATEGORY = HOTSPOT_ANALYSIS_PROMPT_CATEGORY;');
    expect(page).toContain('normalizePromptCategoryName(prompt.category) === HOTSPOT_PROMPT_CATEGORY');
    expect(page).toContain('navigate(`/prompts?category=${encodeURIComponent(HOTSPOT_PROMPT_CATEGORY)}`)');
    expect(page).toContain('CombinedAiConfigSelect');
    expect(page).toContain('usePrompts');
    expect(page).toContain('w-[312px]');
    expect(page).toContain('const hotspotModel =');
    expect(page).toContain('model: hotspotModel');
    expect(page).toContain('callModelStream');
    expect(page).toContain("recordType: 'stream'");
    expect(page).toContain('onReasoning: (chunk) =>');
    expect(page).toContain('setAnalysisReasoning(reasoningContent)');
    expect(page).toContain('<HotspotAnalysisOutput');
    expect(page).toContain('prompt: activeHotspotPrompt?.content.trim() || HOTSPOT_ANALYSIS_SYSTEM_PROMPT');
    expect(page).not.toContain('model: activeModel');
    expect(page).not.toContain('callModel({');
  });

  it('uses a text save button for saving hotspot analysis to the brainstorm library', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContain('保存到脑洞库');
    expect(page).toContain('className="xy-capsule-button"');
    expect(page).toContain('items-center justify-between gap-4 border-t border-slate-100 bg-white px-4');
    expect(page).not.toContain('IconButton label="保存到脑洞库"');
    expect(page).not.toContain('<Save className=');
  });

  it('keeps hotspot actions focused on refresh, save, and centered current-hotspot analysis', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContain("{isFetching ? '刷新中' : '刷新'}");
    expect(page).toContain('mt-6 flex justify-center');
    expect(page).toContain('开始分析');
    expect(page).not.toContain('组合题材');
    expect(page).not.toContain('sendToWorkbench');
    expect(page).not.toContain('IconButton label="送入工作台"');
    expect(page).not.toContain('<Send className=');
    expect(page).not.toContain('buildHotspotCombinationPrompt');
  });

  it('requires explicit start analysis actions instead of auto-analyzing on hotspot selection', () => {
    const page = readSource('src/features/hotspots/pages/HotspotPage.tsx');

    expect(page).toContain('grid-cols-[34px_minmax(0,1fr)_82px]');
    expect(page).toContain('onOpen={() => setActiveItemId(item.id)}');
    expect(page).toContain('onAnalyze={() => void runSingleAnalysis(item)}');
    expect(page).toContain('点击标题只选中');
    expect(page).not.toContain('type="checkbox"');
    expect(page).not.toContain('selectedIds');
    expect(page).not.toContain('toggleSelected');
    expect(page).not.toContain('分析当前热点');
  });
});
