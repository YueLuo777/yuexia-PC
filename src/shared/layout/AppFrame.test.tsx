import { describe, expect, it } from 'vitest';

const readSource = async (relativePath: string) => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
};

describe('writer workspace chrome styling', () => {
  it('uses the requested #E4E9EF color for the top titlebar', async () => {
    const appFrame = await readSource('AppFrame.tsx');
    const styles = await readSource('../styles/index.css');

    expect(styles).toContain('--xy-wa-titlebar: #E4E9EF;');
    expect(styles).toContain('.writer-assistant-theme .xy-wa-titlebar {\n  background: var(--xy-wa-titlebar);');
    expect(appFrame).toContain('className="app-titlebar xy-wa-titlebar flex h-12 shrink-0 items-center border-b px-2"');
  });

  it('lets confirmed custom theme colors override fixed selected and dark-theme chrome styles', async () => {
    const styles = await readSource('../styles/index.css');
    const selectedRuleStart = styles.indexOf('.writer-assistant-theme .xy-selected-content-bg,');
    const selectedRuleEnd = styles.indexOf('.writer-assistant-theme .xy-selected-mint-bg,', selectedRuleStart);
    const selectedRule = styles.slice(selectedRuleStart, selectedRuleEnd);
    const darkTitlebarRules = [...styles.matchAll(/\.theme-dark \.app-titlebar \{[\s\S]*?\}/g)].map((match) => match[0]);

    expect(selectedRule).toContain('background-color: var(--xy-custom-content-selected-bg) !important;');
    expect(selectedRule).not.toContain('background-color: #FFF7ED !important;');
    expect(darkTitlebarRules.length).toBeGreaterThan(0);
    darkTitlebarRules.forEach((rule) => {
      expect(rule).toContain('background: var(--xy-wa-titlebar) !important;');
      expect(rule).not.toContain('background: #252525 !important;');
      expect(rule).not.toContain('background: #1b1b1b !important;');
    });
  });

  it('keeps the writing editor surface free of ruled horizontal lines', async () => {
    const styles = await readSource('../styles/index.css');
    const editorRule = styles.slice(
      styles.indexOf('.xy-wa-editor-surface {'),
      styles.indexOf('.xy-wa-book-cover-empty {'),
    );

    expect(editorRule).toContain('background: var(--xy-wa-editor-bg);');
    expect(editorRule).not.toContain('repeating-linear-gradient');
  });

  it('uses the same readable title size for home and work tabs', async () => {
    const appFrame = await readSource('AppFrame.tsx');
    const tabs = await readSource('../tabs/WorkspaceTabsContext.tsx');
    const styles = await readSource('../styles/index.css');
    const homeRule = styles.slice(
      styles.indexOf('.workspace-tab-home,'),
      styles.indexOf('.xy-wa-book-cover-empty {'),
    );

    expect(tabs).toContain("title: '首页'");
    expect(tabs).toContain("path: '/novels'");
    expect(appFrame).toContain('workspace-tab-home');
    expect(appFrame).toContain('workspace-tab-home-inactive');
    expect(appFrame).toContain('px-3 text-[15px] font-bold text-[#68727f]');
    expect(appFrame).toContain('bg-white font-bold text-[#1f2933]');
    expect(appFrame).not.toContain('px-3 text-[13px] font-medium text-[#68727f]');
    expect(appFrame).not.toContain('bg-white font-semibold text-[#1f2933]');
    expect(homeRule).toContain('font-size: 15px;');
    expect(homeRule).toContain('font-weight: 700;');
  });

  it('always sends the top home tab back to the novel library', async () => {
    const appFrame = await readSource('AppFrame.tsx');

    expect(appFrame).toContain('const activateHomeTab = useCallback(() => {');
    expect(appFrame).toContain('navigate(HOME_TAB.path);');
    expect(appFrame).not.toContain('navigate(readLastHomeRoute());');
    expect(appFrame).not.toContain('HOME_LAST_ROUTE_KEY');
    expect(appFrame).not.toContain('function readLastHomeRoute()');
    expect(appFrame).not.toContain('function rememberHomeRoute(pathname: string)');
  });
});
