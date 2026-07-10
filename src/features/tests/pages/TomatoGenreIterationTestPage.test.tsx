import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('tomato genre iteration test page', () => {
  it('adds the tomato genre iteration prototype to the test collection tools group', () => {
    const collection = readSource('src/features/tests/pages/TestCollectionPage.tsx');

    expect(collection).toContain('TomatoGenreIterationTestPage');
    expect(collection).toContain('/tomato-genre-iteration-test');
    expect(collection).toContain('番茄题材迭代原型');
    expect(collection.indexOf('/test-browser')).toBeLessThan(collection.indexOf('/tomato-genre-iteration-test'));
  });

  it('lays out a three-column browser-driven topic iteration workflow without crawling full text', () => {
    const page = readSource('src/features/tests/pages/TomatoGenreIterationTestPage.tsx');

    expect(page).toContain('gridTemplateColumns: layoutColumns');
    expect(page).toContain('TOMATO_AI_PANEL_MIN_WIDTH = Math.round(TOMATO_AI_PANEL_WIDTH * 0.6)');
    expect(page).toContain('TOMATO_AI_PANEL_RESIZER_WIDTH');
    expect(page).toContain('startAiPanelResize');
    expect(page).toContain('stopAiPanelResizeRef');
    expect(page).toContain('handle.setPointerCapture?.(pointerId)');
    expect(page).toContain("window.addEventListener('pointerup', stopAiPanelResize)");
    expect(page).toContain("window.addEventListener('pointercancel', stopAiPanelResize)");
    expect(page).toContain("window.addEventListener('blur', stopAiPanelResize)");
    expect(page).toContain('onPointerDown={startAiPanelResize}');
    expect(page).toContain('拖拽调整 AI 配置宽度');
    expect(page).toContain('TOMATO_AI_PANEL_COLLAPSED_WIDTH');
    expect(page).toContain('isAiPanelCollapsed');
    expect(page).toContain('PanelRightClose');
    expect(page).toContain('PanelRightOpen');
    expect(page).toContain('TOMATO_BROWSER_DESKTOP_MIN_WIDTH = 1280');
    expect(page).toContain('overflow-x-auto overflow-y-hidden');
    expect(page).toContain('minWidth: `${TOMATO_BROWSER_DESKTOP_MIN_WIDTH}px`');
    expect(page).toContain('TOMATO_BOOKMARKS_KEY');
    expect(page).toContain('TOMATO_HOME_URL_KEY');
    expect(page).toContain("TOMATO_OLD_DEFAULT_URL = 'https://fanqienovel.com/rank'");
    expect(page).toContain('readStoredUrl');
    expect(page).toContain('normalizeTomatoBrowserUrl');
    expect(page).toContain('normalizeTomatoHomeUrl');
    expect(page).toContain("url.searchParams.delete('force_mobile')");
    expect(page).toContain('const latestRawUrl = normalizeBrowserUrl(view.getURL?.() || currentUrlRef.current)');
    expect(page).toContain('const latestDisplayUrl = normalizeTomatoBrowserUrl(latestRawUrl) || latestRawUrl');
    expect(page).toContain('if (latestRawUrl) setCurrentUrl(latestRawUrl)');
    expect(page).toContain('const nextUrl = normalizeTomatoBrowserUrl(rawUrl) || TOMATO_DEFAULT_URL');
    expect(page).toContain('const rawUrl = normalizeBrowserUrl(view?.getURL?.() || inputUrl || currentUrl)');
    expect(page).toContain('stored === TOMATO_OLD_DEFAULT_URL');
    expect(page).toContain('openHome');
    expect(page).toContain('setCurrentAsHome');
    expect(page).toContain('saveCurrentBookmark');
    expect(page).toContain('removeBookmark');
    expect(page).toContain('快捷栏');
    expect(page).toContain('打开首页');
    expect(page).toContain('设为首页');
    expect(page).toContain('收藏名称');
    expect(page).toContain('收藏当前网页');
    expect(page.indexOf('placeholder="收藏名称"')).toBeLessThan(page.indexOf('onClick={setCurrentAsHome}'));
    expect(page).toContain('题材迭代');
    expect(page).toContain('番茄排行榜');
    expect(page).not.toContain('男频分类');
    expect(page).not.toContain('搜索小说');
    expect(page).not.toContain('迭代流程');
    expect(page).toContain("TOMATO_DEFAULT_URL = 'https://fanqienovel.com/rank/1_1_8'");
    expect(page).toContain("React.createElement('webview'");
    expect(page).toContain('getWebviewNavigationUrl');
    expect(page).toContain('patchTomatoLinksToCurrentView');
    expect(page).toContain('executeJavaScript');
    expect(page).toContain("link.setAttribute('target', '_self')");
    expect(page).toContain('openNewWindowInCurrentView');
    expect(page).toContain("view.addEventListener('new-window', openNewWindowInCurrentView)");
    expect(page).toContain("view.addEventListener('did-create-window', openNewWindowInCurrentView)");
    expect(page).not.toContain('allowpopups');
    expect(page).toContain('CombinedAiConfigSelect');
    expect(page).toContain('captureBrowserToInput');
    expect(page).toContain('view.capturePage()');
    expect(page).toContain('截图到输入框');
    expect(page).toContain('当前小说信息');
    expect(page).toContain('题材迁移');
    expect(page).toContain('题材迭代结果会显示在这里。');
  });
});
