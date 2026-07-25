import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const readSource = async (relativePath: string) => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), relativePath), 'utf8');
  if (relativePath !== 'AppFrame.tsx') return source;
  return [
    source,
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'appFrameSupport.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'AppFrameView.tsx'), 'utf8'),
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'useAppFrameNavigationEffects.ts'), 'utf8'),
  ].join('\n');
};

describe('writer workspace chrome styling', () => {
  it('uses the requested #E4E9EF color for the top titlebar', async () => {
    const appFrame = await readSource('AppFrame.tsx');
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(styles).toContainSource('--xy-wa-titlebar: #E4E9EF;');
    expect(styles).toContainSource('.writer-assistant-theme .xy-wa-titlebar {');
    expect(styles).toContainSource('background: var(--xy-wa-titlebar);');
    expect(appFrame).toContainSource(
      'className="app-titlebar xy-wa-titlebar flex h-12 shrink-0 items-center border-b px-2"',
    );
  });

  it('lets confirmed custom theme colors override fixed selected and dark-theme chrome styles', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');
    const selectedRuleStart = styles.indexOf('.writer-assistant-theme .xy-selected-content-bg,');
    const selectedRuleEnd = styles.indexOf('.writer-assistant-theme .xy-selected-mint-bg,', selectedRuleStart);
    const selectedRule = styles.slice(selectedRuleStart, selectedRuleEnd);
    const darkTitlebarRules = [...styles.matchAll(/\.theme-dark \.app-titlebar \{[\s\S]*?\}/g)].map(
      (match) => match[0],
    );

    expect(selectedRule).toContainSource('background-color: var(--xy-custom-content-selected-bg) !important;');
    expect(selectedRule).not.toContainSource('background-color: #FFF7ED !important;');
    expect(darkTitlebarRules.length).toBeGreaterThan(0);
    darkTitlebarRules.forEach((rule) => {
      expect(rule).toContainSource('background: var(--xy-wa-titlebar) !important;');
      expect(rule).not.toContainSource('background: #252525 !important;');
      expect(rule).not.toContainSource('background: #1b1b1b !important;');
    });
  });

  it('keeps the writing editor surface free of ruled horizontal lines', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');
    const editorRule = styles.slice(
      styles.indexOf('.xy-wa-editor-surface {'),
      styles.indexOf('.xy-wa-book-cover-empty {'),
    );

    expect(editorRule).toContainSource('background: var(--xy-wa-editor-bg);');
    expect(editorRule).not.toContainSource('repeating-linear-gradient');
  });

  it('uses the same readable title size for home and work tabs', async () => {
    const appFrame = await readSource('AppFrame.tsx');
    const tabs = await readSource('../tabs/WorkspaceTabsContext.tsx');
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');
    const homeRule = styles.slice(styles.indexOf('.workspace-tab-home,'), styles.indexOf('.xy-wa-book-cover-empty {'));

    expect(tabs).toContainSource("title: '首页'");
    expect(tabs).toContainSource("path: '/novels'");
    expect(appFrame).toContainSource('workspace-tab-home');
    expect(appFrame).toContainSource('workspace-tab-home-inactive');
    expect(appFrame).toContainSource('px-3 text-[15px] font-bold text-[#68727f]');
    expect(appFrame).toContainSource('bg-white font-bold text-[#1f2933]');
    expect(appFrame).not.toContainSource('px-3 text-[13px] font-medium text-[#68727f]');
    expect(appFrame).not.toContainSource('bg-white font-semibold text-[#1f2933]');
    expect(homeRule).toContainSource('font-size: 15px;');
    expect(homeRule).toContainSource('font-weight: 700;');
  });

  it('always sends the top home tab back to the novel library', async () => {
    const appFrame = await readSource('AppFrame.tsx');

    expect(appFrame).toContainSource('const activateHomeTab = useCallback(() => {');
    expect(appFrame).toContainSource('navigate(HOME_TAB.path);');
    expect(appFrame).not.toContainSource('navigate(readLastHomeRoute());');
    expect(appFrame).not.toContainSource('HOME_LAST_ROUTE_KEY');
    expect(appFrame).not.toContainSource('function readLastHomeRoute()');
    expect(appFrame).not.toContainSource('function rememberHomeRoute(pathname: string)');
  });

  it('opens the test section as a full page instead of a modal', async () => {
    const appFrame = await readSource('AppFrame.tsx');

    expect(appFrame).toContainSource('title="测试板块"');
    expect(appFrame).not.toContainSource('title="测试"');
    expect(appFrame).toContainSource("navigate('/test-collection');");
    expect(appFrame).not.toContainSource('setShowTestCollection');
    expect(appFrame).not.toContainSource('showTestCollection');
    expect(appFrame).not.toContainSource('storageId="test_collection"');
  });

  it('exposes default, shuimo, shuimo2 and clean as selectable app theme modes', async () => {
    const appFrame = await readSource('AppFrame.tsx');
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(appFrame).toContainSource("type AppThemeMode = 'light' | 'shuimo' | 'shuimo2' | 'test07';");
    expect(appFrame).toContainSource("const APP_THEME_KEY = 'xinyuexia_app_theme_mode_v1';");
    expect(appFrame).toContainSource("key: 'shuimo'");
    expect(appFrame).toContainSource("key: 'shuimo2'");
    expect(appFrame).toContainSource("key: 'test07'");
    expect(appFrame).toContainSource("label: '默认主题'");
    expect(appFrame).toContainSource("label: '水墨'");
    expect(appFrame).toContainSource("label: '清爽主题'");
    expect(appFrame).not.toContainSource("label: '白色'");
    expect(appFrame).not.toContainSource("label: '07号测试'");
    expect(appFrame).not.toContainSource("key: 'dark'");
    expect(appFrame).not.toContainSource("label: '黑色'");
    expect(appFrame).not.toContainSource("themeMode === 'dark'");
    expect(appFrame).toContainSource('setIsThemeMenuOpen((prev) => !prev)');
    expect(appFrame).toContainSource('aria-haspopup="menu"');
    expect(appFrame).toContainSource('xy-theme-menu');
    expect(appFrame).toContainSource('xy-theme-trigger-button');
    expect(appFrame).toContainSource('xy-theme-trigger-label');
    expect(appFrame).not.toContainSource('xy-theme-option-swatches');
    expect(appFrame).not.toContainSource('预览色');
    expect(appFrame).not.toContainSource('xy-dark-theme-switch-track');
    expect(appFrame).not.toContainSource('setIsDarkTheme((prev) => !prev)');
    expect(appFrame).toContainSource('{THEME_OPTIONS.map(renderThemeOption)}');
    expect(appFrame).not.toContainSource('{renderThemeOption(THEME_OPTIONS[0])}');

    expect(styles).toContainSource('html.theme-shuimo {');
    expect(styles).toContainSource('.theme-shuimo .app-titlebar {');
    expect(styles).toContainSource('html.theme-shuimo2 {');
    expect(styles).toContainSource('.theme-shuimo2 .app-titlebar {');
    expect(styles).toContainSource('--xy-wa-blue: #7C5732;');
    expect(styles).toContainSource('--xy-wa-active: #EAD2AE;');
    expect(styles).toContainSource('--xy-wa-active-soft: #F4E8D5;');
    expect(styles).toContainSource('--xy-wa-accent-border: #CDAF87;');
    expect(styles).toContainSource('html.theme-test07 {');
    expect(styles).toContainSource('.theme-test07 .app-titlebar {');
    expect(styles).toContainSource('.theme-test07 .xy-dashboard-sidebar {');
    expect(styles).toContainSource('.xy-theme-trigger-button {');
    expect(styles).toContainSource('border: 1px solid #d8dbe0;');
    expect(styles).toContainSource('background: #ffffff;');
    expect(styles).not.toContainSource('.xy-dark-theme-switch-track');
    expect(styles).not.toContainSource('.xy-dark-theme-switch.xy-dark-active');
    expect(styles).toContainSource('.xy-theme-menu {');
  });

  it('uses user-facing theme names and closes the theme menu on outside pointer down', async () => {
    const appFrame = await readSource('AppFrame.tsx');

    expect(appFrame).toContainSource("label: '默认主题'");
    expect(appFrame).toContainSource("label: '水墨'");
    expect(appFrame).toContainSource("label: '清爽主题'");
    expect(appFrame).not.toContainSource("label: '白色'");
    expect(appFrame).not.toContainSource("label: '07号测试'");
    expect(appFrame).toContainSource('const themeMenuRef = useRef<HTMLDivElement | null>(null);');
    expect(appFrame).toContainSource('handleThemeMenuOutsidePointerDown');
    expect(appFrame).toContainSource("document.addEventListener('pointerdown', handleThemeMenuOutsidePointerDown);");
    expect(appFrame).toContainSource('if (themeMenuRef.current?.contains(event.target as Node)) return;');
    expect(appFrame).toContainSource('ref={themeMenuRef}');
  });

  it('skips globally static modals when applying fallback drag and resize behavior', async () => {
    const appFrame = await readSource('AppFrame.tsx');

    expect(appFrame).toContainSource("dialog.dataset.globalModalStatic === 'true'");
    expect(appFrame).toContainSource(
      "if (!dialog || dialog.dataset.draggableManaged === 'true' || dialog.dataset.globalModalStatic === 'true') return;",
    );
    expect(appFrame).toContainSource('ensureResizeHandle(dialog);');
  });

  it('keeps the shuimo dashboard sidebar in a light paper palette', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(styles).not.toContainSource('#22342F');
    expect(styles).toContainSource('.theme-shuimo .xy-dashboard-sidebar {');
    expect(styles).toContainSource('background: #F2E9D8 !important;');
    expect(styles).toContainSource('.theme-shuimo .xy-dashboard-sidebar-footer a {');
    expect(styles).toContainSource('background: #08AACE !important;');
  });

  it('uses the paper-lift selected entry state in the shuimo theme', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(styles).toContainSource('.theme-shuimo .xy-selected-mint-bg,');
    expect(styles).toContainSource('background-color: #FFFFFF !important;');
    expect(styles).toContainSource('border-color: #B8A78D !important;');
    expect(styles).toContainSource('box-shadow: 0 6px 14px rgba(80, 58, 28, 0.18) !important;');
    expect(styles).toContainSource('color: #25211B !important;');
    expect(styles).toContainSource('.theme-shuimo .xy-selected-mint-bg::before');
    expect(styles).toContainSource("content: '✦';");
    expect(styles).toContainSource('color: #8A5A18;');
    expect(styles).toContainSource('.theme-shuimo .xy-selected-mint-bg .text-\\[\\#08AACE\\]');
    expect(styles).toContainSource('color: #087F99 !important;');
  });

  it('renders the shuimo paper-lift marker as the same line sparkles icon used in the preview', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');
    const markerRuleStart = styles.indexOf('.theme-shuimo .xy-selected-mint-bg::before');
    const markerRuleEnd = styles.indexOf(
      '.theme-shuimo .xy-chapter-sidebar-row.xy-selected-mint-bg::before',
      markerRuleStart,
    );
    const markerRule = styles.slice(markerRuleStart, markerRuleEnd);

    expect(markerRuleStart).toBeGreaterThanOrEqual(0);
    expect(markerRule).toContainSource("content: '';");
    expect(markerRule).toContainSource('-webkit-mask: url("data:image/svg+xml');
    expect(markerRule).toContainSource('mask: url("data:image/svg+xml');
    expect(markerRule).toContainSource("stroke-linecap='round'");
    expect(markerRule).toContainSource('background-color: #8A5A18;');
    expect(markerRule).toContainSource('width: 1rem;');
    expect(markerRule).toContainSource('height: 1rem;');
  });

  it('uses the same line sparkles paper-lift marker in the shuimo2 theme', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');
    const markerRuleStart = styles.indexOf('.theme-shuimo2 .xy-selected-mint-bg::before');
    const markerRuleEnd = styles.indexOf(
      '.theme-shuimo2 .xy-chapter-sidebar-row.xy-selected-mint-bg::before',
      markerRuleStart,
    );
    const markerRule = styles.slice(markerRuleStart, markerRuleEnd);

    expect(markerRuleStart).toBeGreaterThanOrEqual(0);
    expect(markerRule).toContainSource("content: '';");
    expect(markerRule).toContainSource('-webkit-mask: url("data:image/svg+xml');
    expect(markerRule).toContainSource('mask: url("data:image/svg+xml');
    expect(markerRule).toContainSource("stroke-linecap='round'");
    expect(markerRule).toContainSource('background-color: #8A5A18;');
    expect(markerRule).toContainSource('width: 1rem;');
    expect(markerRule).toContainSource('height: 1rem;');
    expect(styles).toContainSource('.theme-shuimo2 .xy-chapter-sidebar-row.xy-selected-mint-bg::before');
  });

  it('tones down floating label backplates in shuimo2 so field titles do not look like white stickers', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(styles).toContainSource('.theme-shuimo2 .xy-floating-field.xy-floating-outline-fixed label');
    expect(styles).toContainSource('.theme-shuimo2 .xy-floating-field.xy-floating-outline-fixed.xy-has-value label');
    expect(styles).toContainSource('.theme-shuimo2 .xy-floating-title-count');
    expect(styles).toContainSource('background-color: #FFF8EC !important;');
    expect(styles).toContainSource('border-color: #CDAF87 !important;');
    expect(styles).toContainSource('box-shadow: 0 0 0 1px #FFF8EC;');
  });

  it('applies the aged-scroll palette proposal as the formal shuimo2 theme', async () => {
    const styles = await Array.from({ length: 12 }, (_, index) =>
      readFileSync(
        resolve(process.cwd(), 'src/shared/styles/parts', `part-${String(index + 1).padStart(2, '0')}.css`),
        'utf8',
      ),
    ).join('\n');

    expect(styles).toContainSource('--xy-wa-titlebar: #E8D6BD;');
    expect(styles).toContainSource('--xy-wa-app-bg: #F4E9D8;');
    expect(styles).toContainSource('--xy-custom-sidebar-bg: #EBDCC3;');
    expect(styles).toContainSource('--xy-custom-sidebar-active-bg: #F0D8B8;');
    expect(styles).toContainSource('--xy-custom-content-selected-bg: #EFD7B7;');
    expect(styles).toContainSource('--xy-custom-flow-group-bg: #EBDCC3;');
    expect(styles).toContainSource('--xy-wa-panel: #FFF8EC;');
    expect(styles).toContainSource('--xy-wa-toolbar: #F7EEDC;');
    expect(styles).toContainSource('--xy-wa-border: #D5BFA0;');
    expect(styles).toContainSource('--xy-wa-border-strong: #CDAF87;');
    expect(styles).toContainSource('--xy-wa-blue: #7C5732;');
    expect(styles).toContainSource('--xy-wa-blue-hover: #654524;');
    expect(styles).toContainSource('--xy-wa-active: #EAD2AE;');
    expect(styles).toContainSource('--xy-wa-active-soft: #F4E8D5;');
    expect(styles).toContainSource('.theme-shuimo2 .xy-dashboard-sidebar {');
    expect(styles).toContainSource('background: #E4D1B3 !important;');
    expect(styles).toContainSource('.theme-shuimo2 .xy-dashboard-sidebar-active {');
    expect(styles).toContainSource('background: #F0D8B8 !important;');
    expect(styles).toContainSource('.theme-shuimo2 .script-editor-chapter-active,');
    expect(styles).toContainSource('background: #EAD2AE !important;');
  });
});
