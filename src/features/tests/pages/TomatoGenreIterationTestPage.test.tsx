import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readSource = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('tomato genre iteration test page', () => {
  it('adds the tomato genre iteration prototype to the test collection tools group', () => {
    const collection = readSource('src/features/tests/pages/TestCollectionPage.tsx');

    expect(collection).toContainSource('TomatoGenreIterationTestPage');
    expect(collection).toContainSource('/tomato-genre-iteration-test');
    expect(collection).toContainSource('番茄题材迭代原型');
    expect(collection.indexOf('/test-browser')).toBeLessThan(collection.indexOf('/tomato-genre-iteration-test'));
  });

  it('lays out a three-column browser-driven topic iteration workflow without crawling full text', () => {
    const page = readSource('src/features/tests/pages/TomatoGenreIterationTestPage.tsx');

    expect(page).toContainSource('gridTemplateColumns: layoutColumns');
    expect(page).toContainSource('TOMATO_AI_PANEL_MIN_WIDTH = Math.round(TOMATO_AI_PANEL_WIDTH * 0.6)');
    expect(page).toContainSource('TOMATO_AI_PANEL_RESIZER_WIDTH');
    expect(page).toContainSource('startAiPanelResize');
    expect(page).toContainSource('stopAiPanelResizeRef');
    expect(page).toContainSource('handle.setPointerCapture?.(pointerId)');
    expect(page).toContainSource("window.addEventListener('pointerup', stopAiPanelResize)");
    expect(page).toContainSource("window.addEventListener('pointercancel', stopAiPanelResize)");
    expect(page).toContainSource("window.addEventListener('blur', stopAiPanelResize)");
    expect(page).toContainSource('onPointerDown={startAiPanelResize}');
    expect(page).toContainSource('拖拽调整 AI 配置宽度');
    expect(page).toContainSource('TOMATO_AI_PANEL_COLLAPSED_WIDTH');
    expect(page).toContainSource('isAiPanelCollapsed');
    expect(page).toContainSource('PanelRightClose');
    expect(page).toContainSource('PanelRightOpen');
    expect(page).toContainSource('TOMATO_BROWSER_DESKTOP_MIN_WIDTH = 1280');
    expect(page).toContainSource('overflow-x-auto overflow-y-hidden');
    expect(page).toContainSource('minWidth: `${TOMATO_BROWSER_DESKTOP_MIN_WIDTH}px`');
    expect(page).toContainSource('TOMATO_BOOKMARKS_KEY');
    expect(page).toContainSource('TOMATO_HOME_URL_KEY');
    expect(page).toContainSource("TOMATO_OLD_DEFAULT_URL = 'https://fanqienovel.com/rank'");
    expect(page).toContainSource('readStoredUrl');
    expect(page).toContainSource('normalizeTomatoBrowserUrl');
    expect(page).toContainSource('normalizeTomatoHomeUrl');
    expect(page).toContainSource("url.searchParams.delete('force_mobile')");
    expect(page).toContainSource('const latestRawUrl = normalizeBrowserUrl(view.getURL?.() || currentUrlRef.current)');
    expect(page).toContainSource('const latestDisplayUrl = normalizeTomatoBrowserUrl(latestRawUrl) || latestRawUrl');
    expect(page).toContainSource('if (latestRawUrl) setCurrentUrl(latestRawUrl)');
    expect(page).toContainSource('const nextUrl = normalizeTomatoBrowserUrl(rawUrl) || TOMATO_DEFAULT_URL');
    expect(page).toContainSource('const rawUrl = normalizeBrowserUrl(view?.getURL?.() || inputUrl || currentUrl)');
    expect(page).toContainSource('stored === TOMATO_OLD_DEFAULT_URL');
    expect(page).toContainSource('openHome');
    expect(page).toContainSource('setCurrentAsHome');
    expect(page).toContainSource('saveCurrentBookmark');
    expect(page).toContainSource('removeBookmark');
    expect(page).toContainSource('快捷栏');
    expect(page).toContainSource('打开首页');
    expect(page).toContainSource('设为首页');
    expect(page).toContainSource('收藏名称');
    expect(page).toContainSource('收藏当前网页');
    expect(page.indexOf('placeholder="收藏名称"')).toBeLessThan(page.indexOf('onClick={setCurrentAsHome}'));
    expect(page).toContainSource('题材迭代');
    expect(page).toContainSource('番茄排行榜');
    expect(page).not.toContainSource('男频分类');
    expect(page).not.toContainSource('搜索小说');
    expect(page).not.toContainSource('迭代流程');
    expect(page).toContainSource("TOMATO_DEFAULT_URL = 'https://fanqienovel.com/rank/1_1_8'");
    expect(page).toContainSource("React.createElement('webview'");
    expect(page).toContainSource('getWebviewNavigationUrl');
    expect(page).toContainSource('patchTomatoLinksToCurrentView');
    expect(page).toContainSource('executeJavaScript');
    expect(page).toContainSource("link.setAttribute('target', '_self')");
    expect(page).toContainSource('openNewWindowInCurrentView');
    expect(page).toContainSource("view.addEventListener('new-window', openNewWindowInCurrentView)");
    expect(page).toContainSource("view.addEventListener('did-create-window', openNewWindowInCurrentView)");
    expect(page).not.toContainSource('allowpopups');
    expect(page).toContainSource('CombinedAiConfigSelect');
    expect(page).toContainSource('captureBrowserToInput');
    expect(page).toContainSource('view.capturePage()');
    expect(page).toContainSource('截图到输入框');
    expect(page).toContainSource('当前小说信息');
    expect(page).toContainSource('题材迁移');
    expect(page).toContainSource('题材迭代结果会显示在这里。');
  });
});
