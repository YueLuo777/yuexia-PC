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

  it('names the test navigation entry as test section', async () => {
    const appFrame = await readSource('AppFrame.tsx');

    expect(appFrame).toContain('title="测试板块"');
    expect(appFrame).not.toContain('title="测试"');
  });

  it('exposes default, shuimo, shuimo2 and clean as selectable app theme modes', async () => {
    const appFrame = await readSource('AppFrame.tsx');
    const styles = await readSource('../styles/index.css');

    expect(appFrame).toContain("type AppThemeMode = 'light' | 'shuimo' | 'shuimo2' | 'test07';");
    expect(appFrame).toContain("const APP_THEME_KEY = 'xinyuexia_app_theme_mode_v1';");
    expect(appFrame).toContain("key: 'shuimo'");
    expect(appFrame).toContain("key: 'shuimo2'");
    expect(appFrame).toContain("key: 'test07'");
    expect(appFrame).toContain("label: '默认主题'");
    expect(appFrame).toContain("label: '水墨'");
    expect(appFrame).toContain("label: '清爽主题'");
    expect(appFrame).not.toContain("label: '白色'");
    expect(appFrame).not.toContain("label: '07号测试'");
    expect(appFrame).not.toContain("key: 'dark'");
    expect(appFrame).not.toContain("label: '黑色'");
    expect(appFrame).not.toContain('themeMode === \'dark\'');
    expect(appFrame).toContain('setIsThemeMenuOpen((prev) => !prev)');
    expect(appFrame).toContain('aria-haspopup="menu"');
    expect(appFrame).toContain('xy-theme-menu');
    expect(appFrame).toContain('xy-theme-trigger-button');
    expect(appFrame).toContain('xy-theme-trigger-label');
    expect(appFrame).not.toContain('xy-theme-option-swatches');
    expect(appFrame).not.toContain('预览色');
    expect(appFrame).not.toContain('xy-dark-theme-switch-track');
    expect(appFrame).not.toContain('setIsDarkTheme((prev) => !prev)');
    expect(appFrame).toContain('{THEME_OPTIONS.map(renderThemeOption)}');
    expect(appFrame).not.toContain('{renderThemeOption(THEME_OPTIONS[0])}');

    expect(styles).toContain('html.theme-shuimo {');
    expect(styles).toContain('.theme-shuimo .app-titlebar {');
    expect(styles).toContain('html.theme-shuimo2 {');
    expect(styles).toContain('.theme-shuimo2 .app-titlebar {');
    expect(styles).toContain('--xy-wa-blue: #7C5732;');
    expect(styles).toContain('--xy-wa-active: #EAD2AE;');
    expect(styles).toContain('--xy-wa-active-soft: #F4E8D5;');
    expect(styles).toContain('--xy-wa-accent-border: #CDAF87;');
    expect(styles).toContain('html.theme-test07 {');
    expect(styles).toContain('.theme-test07 .app-titlebar {');
    expect(styles).toContain('.theme-test07 .xy-dashboard-sidebar {');
    expect(styles).toContain('.xy-theme-trigger-button {');
    expect(styles).toContain('border: 1px solid #d8dbe0;');
    expect(styles).toContain('background: #ffffff;');
    expect(styles).not.toContain('.xy-dark-theme-switch-track');
    expect(styles).not.toContain('.xy-dark-theme-switch.xy-dark-active');
    expect(styles).toContain('.xy-theme-menu {');
  });

  it('uses user-facing theme names and closes the theme menu on outside pointer down', async () => {
    const appFrame = await readSource('AppFrame.tsx');

    expect(appFrame).toContain("label: '默认主题'");
    expect(appFrame).toContain("label: '水墨'");
    expect(appFrame).toContain("label: '清爽主题'");
    expect(appFrame).not.toContain("label: '白色'");
    expect(appFrame).not.toContain("label: '07号测试'");
    expect(appFrame).toContain('const themeMenuRef = useRef<HTMLDivElement | null>(null);');
    expect(appFrame).toContain('handleThemeMenuOutsidePointerDown');
    expect(appFrame).toContain("document.addEventListener('pointerdown', handleThemeMenuOutsidePointerDown);");
    expect(appFrame).toContain('if (themeMenuRef.current?.contains(event.target as Node)) return;');
    expect(appFrame).toContain('ref={themeMenuRef}');
  });

  it('keeps the shuimo dashboard sidebar in a light paper palette', async () => {
    const styles = await readSource('../styles/index.css');

    expect(styles).not.toContain('#22342F');
    expect(styles).toContain('.theme-shuimo .xy-dashboard-sidebar {');
    expect(styles).toContain('background: #F2E9D8 !important;');
    expect(styles).toContain('.theme-shuimo .xy-dashboard-sidebar-footer a {');
    expect(styles).toContain('background: #08AACE !important;');
  });

  it('uses the paper-lift selected entry state in the shuimo theme', async () => {
    const styles = await readSource('../styles/index.css');

    expect(styles).toContain('.theme-shuimo .xy-selected-mint-bg,');
    expect(styles).toContain('background-color: #FFFFFF !important;');
    expect(styles).toContain('border-color: #B8A78D !important;');
    expect(styles).toContain('box-shadow: 0 6px 14px rgba(80, 58, 28, 0.18) !important;');
    expect(styles).toContain('color: #25211B !important;');
    expect(styles).toContain('.theme-shuimo .xy-selected-mint-bg::before');
    expect(styles).toContain('content: "✦";');
    expect(styles).toContain('color: #8A5A18;');
    expect(styles).toContain('.theme-shuimo .xy-selected-mint-bg .text-\\[\\#08AACE\\]');
    expect(styles).toContain('color: #087F99 !important;');
  });

  it('renders the shuimo paper-lift marker as the same line sparkles icon used in the preview', async () => {
    const styles = await readSource('../styles/index.css');
    const markerRuleStart = styles.indexOf('.theme-shuimo .xy-selected-mint-bg::before');
    const markerRuleEnd = styles.indexOf('.theme-shuimo .xy-chapter-sidebar-row.xy-selected-mint-bg::before', markerRuleStart);
    const markerRule = styles.slice(markerRuleStart, markerRuleEnd);

    expect(markerRuleStart).toBeGreaterThanOrEqual(0);
    expect(markerRule).toContain('content: "";');
    expect(markerRule).toContain('-webkit-mask: url("data:image/svg+xml');
    expect(markerRule).toContain('mask: url("data:image/svg+xml');
    expect(markerRule).toContain("stroke-linecap='round'");
    expect(markerRule).toContain('background-color: #8A5A18;');
    expect(markerRule).toContain('width: 1rem;');
    expect(markerRule).toContain('height: 1rem;');
  });

  it('uses the same line sparkles paper-lift marker in the shuimo2 theme', async () => {
    const styles = await readSource('../styles/index.css');
    const markerRuleStart = styles.indexOf('.theme-shuimo2 .xy-selected-mint-bg::before');
    const markerRuleEnd = styles.indexOf('.theme-shuimo2 .xy-chapter-sidebar-row.xy-selected-mint-bg::before', markerRuleStart);
    const markerRule = styles.slice(markerRuleStart, markerRuleEnd);

    expect(markerRuleStart).toBeGreaterThanOrEqual(0);
    expect(markerRule).toContain('content: "";');
    expect(markerRule).toContain('-webkit-mask: url("data:image/svg+xml');
    expect(markerRule).toContain('mask: url("data:image/svg+xml');
    expect(markerRule).toContain("stroke-linecap='round'");
    expect(markerRule).toContain('background-color: #8A5A18;');
    expect(markerRule).toContain('width: 1rem;');
    expect(markerRule).toContain('height: 1rem;');
    expect(styles).toContain('.theme-shuimo2 .xy-chapter-sidebar-row.xy-selected-mint-bg::before');
  });

  it('tones down floating label backplates in shuimo2 so field titles do not look like white stickers', async () => {
    const styles = await readSource('../styles/index.css');

    expect(styles).toContain('.theme-shuimo2 .xy-floating-field.xy-floating-outline-fixed label');
    expect(styles).toContain('.theme-shuimo2 .xy-floating-field.xy-floating-outline-fixed.xy-has-value label');
    expect(styles).toContain('.theme-shuimo2 .xy-capsule-custom-field-size legend');
    expect(styles).toContain('background-color: #FFF8EC !important;');
    expect(styles).toContain('border-color: #CDAF87 !important;');
    expect(styles).toContain('box-shadow: 0 0 0 1px #FFF8EC;');
  });

  it('applies the aged-scroll palette proposal as the formal shuimo2 theme', async () => {
    const styles = await readSource('../styles/index.css');

    expect(styles).toContain('--xy-wa-titlebar: #E8D6BD;');
    expect(styles).toContain('--xy-wa-app-bg: #F4E9D8;');
    expect(styles).toContain('--xy-custom-sidebar-bg: #EBDCC3;');
    expect(styles).toContain('--xy-custom-sidebar-active-bg: #F0D8B8;');
    expect(styles).toContain('--xy-custom-content-selected-bg: #EFD7B7;');
    expect(styles).toContain('--xy-custom-flow-group-bg: #EBDCC3;');
    expect(styles).toContain('--xy-wa-panel: #FFF8EC;');
    expect(styles).toContain('--xy-wa-toolbar: #F7EEDC;');
    expect(styles).toContain('--xy-wa-border: #D5BFA0;');
    expect(styles).toContain('--xy-wa-border-strong: #CDAF87;');
    expect(styles).toContain('--xy-wa-blue: #7C5732;');
    expect(styles).toContain('--xy-wa-blue-hover: #654524;');
    expect(styles).toContain('--xy-wa-active: #EAD2AE;');
    expect(styles).toContain('--xy-wa-active-soft: #F4E8D5;');
    expect(styles).toContain('.theme-shuimo2 .xy-dashboard-sidebar {');
    expect(styles).toContain('background: #E4D1B3 !important;');
    expect(styles).toContain('.theme-shuimo2 .xy-dashboard-sidebar-active {');
    expect(styles).toContain('background: #F0D8B8 !important;');
    expect(styles).toContain('.theme-shuimo2 .script-editor-chapter-active,');
    expect(styles).toContain('background: #EAD2AE !important;');
  });
});
