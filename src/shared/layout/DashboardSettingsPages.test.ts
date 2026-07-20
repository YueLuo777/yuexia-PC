import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import { APP_ROUTE_PATHS, INTERNAL_ROUTE_DEFINITIONS, LEGACY_ROUTE_REDIRECTS } from '../../app/routeRegistry';
import { readErrorLogDefaultEntriesSource } from '../../features/tests/model/readErrorLogDefaultEntriesSource';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('dashboard unified settings page', () => {
  it('routes the footer to one settings page instead of four separate entries', () => {
    const dashboard = readSource('src/shared/layout/DashboardLayout.tsx');
    const footerStart = dashboard.indexOf('data-testid="dashboard-footer-settings-group"');
    const footerEnd = dashboard.indexOf('</aside>', footerStart);
    const footerSource = dashboard.slice(footerStart, footerEnd);

    expect(footerStart).toBeGreaterThan(-1);
    expect(footerSource).toContainSource('to="/settings"');
    expect(footerSource).toContainSource('title="设置"');
    expect(footerSource).toContainSource('设置');
    expect(footerSource).toContainSource('className={SETTINGS_TEXT_BUTTON_CLASS}');
    expect(footerSource).not.toContainSource('to="/system-settings"');
    expect(footerSource).not.toContainSource('to="/theme-colors"');
    expect(footerSource).not.toContainSource('to="/shortcut-settings"');
    expect(footerSource).not.toContainSource('to="/nav-settings"');
  });

  it('uses the same solid cyan button tone as the chapter add-volume button for the settings entry', () => {
    const dashboard = readSource('src/shared/layout/DashboardLayout.tsx');
    const chapterSidebar = readSource('src/features/workbench/components/ChapterSidebar.tsx');

    expect(chapterSidebar).toContainSource('bg-[#08AACE] hover:bg-[#0798b8]');
    expect(dashboard).toContainSource('bg-[#08AACE]');
    expect(dashboard).toContainSource('hover:bg-[#0798b8]');
    expect(dashboard).toContainSource('text-white');
    expect(dashboard).not.toContainSource('border border-brand/20 bg-white px-2');
  });

  it('registers the unified settings route and redirects old settings URLs to sections', () => {
    const app = readSource('src/app/App.tsx');
    const internalRoutes = readSource('src/app/InternalRoutesPage.tsx');
    const legacyRedirects = Object.fromEntries(LEGACY_ROUTE_REDIRECTS.map((redirect) => [redirect.path, redirect.to]));
    const themeColorsRoute = INTERNAL_ROUTE_DEFINITIONS.find((route) => route.id === 'themeColors');

    expect(app).toContainSource('SettingsPage');
    expect(APP_ROUTE_PATHS.settings).toBe('/settings');
    expect(legacyRedirects['/system-settings']).toBe('/settings?section=system');
    expect(legacyRedirects['/shortcut-settings']).toBe('/settings?section=shortcuts');
    expect(themeColorsRoute?.redirectTo).toBe('/settings?section=theme');
    expect(legacyRedirects['/nav-settings']).toBe('/settings?section=navigation');
    expect(app).toContainSource('FORMAL_ROUTE_DEFINITIONS');
    expect(app).toContainSource('LEGACY_ROUTE_REDIRECTS.map');
    expect(internalRoutes).toContainSource('INTERNAL_ROUTE_DEFINITIONS.map');
  });

  it('keeps the four settings areas inside the unified settings shell', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');
    const compactSections = readSource('src/shared/settings/SystemSettingsCompactSections.tsx');

    expect(settingsPage).toContainSource("| 'association'");
    expect(settingsPage).toContainSource("| 'appIcon'");
    expect(settingsPage).toContainSource("id: 'system'");
    expect(settingsPage).toContainSource("id: 'backup'");
    expect(settingsPage).toContainSource('数据迁移');
    expect(settingsPage).toContainSource('DbSettingsPage');
    expect(settingsPage).toContainSource("id: 'shortcuts'");
    expect(settingsPage).toContainSource("id: 'theme'");
    expect(settingsPage).toContainSource("id: 'navigation'");
    expect(settingsPage).toContainSource("id: 'defaultCover'");
    expect(settingsPage).toContainSource('默认封面设置');
    expect(settingsPage).toContainSource('DefaultCoverSettingsPage');
    expect(settingsPage).toContainSource("{ id: 'user', label: '用户设置', items: USER_SETTINGS_NAV_ITEMS }");
    expect(settingsPage).toContainSource("{ id: 'test', label: '测试设置', items: TEST_SETTINGS_NAV_ITEMS }");
    expect(settingsPage).toContainSource('用户设置');
    expect(settingsPage).toContainSource('测试设置');
    expect(settingsPage).toContainSource('const TEST_SETTINGS_NAV_ITEMS: SettingsNavItem[] = [');
    expect(settingsPage).toContainSource("{ id: 'theme', label: '主题颜色'");
    expect(settingsPage).toContainSource("{ id: 'association', label: '关联设置'");
    expect(settingsPage).toContainSource("{ id: 'appIcon', label: '软件图标'");
    expect(settingsPage).toContainSource('variant="embedded"');
    expect(settingsPage).toContainSource('border-b border-slate-100 bg-white px-6 pt-4');
    expect(settingsPage).toContainSource('overflow-y-auto bg-white px-6 py-3');
    expect(settingsPage).not.toContainSource('SYSTEM_SETTINGS_TABS');
    expect(settingsPage).toContainSource('activeTab="window"');
    expect(settingsPage).toContainSource('activeTab="association"');
    expect(settingsPage).toContainSource('activeTab="appIcon"');
    expect(settingsPage).toContainSource('hideTabNavigation');
    expect(compactSections).toContainSource('sm:grid-cols-2 xl:grid-cols-4');
    expect(compactSections).not.toContainSource('mx-auto');
    expect(compactSections).not.toContainSource('max-w-[1080px]');
  });

  it('separates user-visible settings from test-only settings', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');
    const userStart = settingsPage.indexOf('const USER_SETTINGS_NAV_ITEMS');
    const testStart = settingsPage.indexOf('const TEST_SETTINGS_NAV_ITEMS');
    const groupsStart = settingsPage.indexOf('const SETTINGS_NAV_GROUPS');
    const userSettings = settingsPage.slice(userStart, testStart);
    const testSettings = settingsPage.slice(testStart, groupsStart);

    expect(userStart).toBeGreaterThan(-1);
    expect(testStart).toBeGreaterThan(userStart);
    expect(groupsStart).toBeGreaterThan(testStart);
    for (const label of ['系统设置', '数据迁移', '快捷键设置', '导航设置', '默认封面设置']) {
      expect(userSettings).toContainSource(label);
    }
    expect(userSettings).not.toContainSource('主题颜色');
    expect(userSettings).not.toContainSource("id: 'association'");
    expect(userSettings).not.toContainSource("id: 'appIcon'");
    expect(testSettings).toContainSource('主题颜色');
    expect(testSettings).toContainSource('关联设置');
    expect(testSettings).toContainSource('软件图标');
    expect(testSettings).not.toContainSource('系统设置');
    expect(userSettings.indexOf('系统设置')).toBeLessThan(userSettings.indexOf('数据迁移'));
    expect(userSettings.indexOf('数据迁移')).toBeLessThan(userSettings.indexOf('快捷键设置'));
    expect(userSettings.indexOf('快捷键设置')).toBeLessThan(userSettings.indexOf('导航设置'));
    expect(userSettings.indexOf('导航设置')).toBeLessThan(userSettings.indexOf('默认封面设置'));
  });

  it('removes repeated section banners and the retired system subnavigation', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');
    const primaryNavigation = settingsPage.indexOf('设置顶部导航');
    const content = settingsPage.indexOf('<section className="min-h-0 flex-1 overflow-y-auto', primaryNavigation);

    expect(primaryNavigation).toBeGreaterThan(-1);
    expect(content).toBeGreaterThan(primaryNavigation);
    expect(settingsPage).not.toContainSource('SystemTabButtons');
    expect(settingsPage).not.toContainSource('min-h-[72px]');
    expect(settingsPage).not.toContainSource('{activeNavItem.label}');
    expect(settingsPage).not.toContainSource('<ActiveIcon');
  });

  it('keeps settings pages plain and exposes window size memory', () => {
    const systemSettings = readSource('src/shared/settings/SystemSettingsModal.tsx');
    const compactSections = readSource('src/shared/settings/SystemSettingsCompactSections.tsx');
    const shortcutSettings = readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx');
    const navSettings = readSource('src/shared/navigation/NavSettingsModal.tsx');
    const themeSettings = [
      readSource('src/features/tests/pages/DarkThemeColorPage.tsx'),
      readSource('src/features/tests/pages/DarkThemeColorPageView.tsx'),
      readSource('src/features/tests/pages/darkThemeColorData.ts'),
    ].join('\n');
    const electronMain = readSource('electron/main.cjs');
    const windowBounds = readSource('electron/windowBounds.cjs');
    const windowStateStore = readSource('electron/windowStateStore.cjs');
    const sharedButtonClasses = readSource('src/shared/ui/actionButtonClasses.ts');

    expect(systemSettings).toContainSource("type SettingsTab = 'window' | 'association' | 'appIcon'");
    expect(systemSettings).toContainSource('window.xinyuexiaWindow.updateSettings');
    expect(systemSettings).toContainSource('window.xinyuexiaWindow.applyBoundsPreset');
    expect(systemSettings).toContainSource("window.addEventListener('resize', refreshCurrentBounds)");
    expect(systemSettings).toContainSource('SystemSettingsCompactSections');
    expect(systemSettings).toContainSource('WindowSettingsCompactSection');
    expect(systemSettings).toContainSource('AssociationSettingsCompactSection');
    expect(systemSettings).not.toContainSource('flex flex-wrap items-start justify-between gap-4');
    expect(compactSections).toContainSource('const currentBounds = settings?.currentBounds ?? defaultBounds;');
    expect(compactSections).toContainSource('const startupBounds = settings?.startupBounds ?? defaultBounds;');
    expect(compactSections).toContainSource('aria-label="窗口大小记忆"');
    expect(compactSections).toContainSource('<fieldset disabled={rememberSize}');
    expect(compactSections).toContainSource('应用并预览');
    expect(compactSections).toContainSource('{ width: 2064, height: 1120 }');
    expect(systemSettings).toContainSource(
      "import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';",
    );
    expect(systemSettings).toContainSource('PRIMARY_TEXT_BUTTON_CLASS');
    expect(sharedButtonClasses).toContainSource('bg-[#08AACE]');
    expect(sharedButtonClasses).toContainSource('hover:bg-[#0798b8]');
    expect(electronMain).toContainSource("registerTrustedIpcHandler('window-settings:update'");
    expect(electronMain).toContainSource("registerTrustedIpcHandler('window-settings:apply-bounds-preset'");
    expect(electronMain).toContainSource('windowStateStore.readSettings().rememberSize');
    expect(electronMain).toContainSource('fitStartupBoundsToWorkArea');
    expect(electronMain).toContainSource('fitWindowBoundsToWorkArea(requestedBounds, display.workArea)');
    expect(electronMain).not.toContainSource('STARTUP_MAX_WORK_AREA_HEIGHT_RATIO');
    expect(windowBounds).toContainSource('const width = Math.min(requestedWidth');
    expect(windowBounds).toContainSource('const height = Math.min(requestedHeight');
    expect(windowStateStore).toContainSource('if (!settings.rememberSize) return { ...settings.startupBounds, isMaximized: false };');

    expect(shortcutSettings).toContainSource("variant?: 'modal' | 'page' | 'embedded'");
    expect(navSettings).toContainSource("variant?: 'modal' | 'page' | 'embedded'");
    expect(themeSettings).toContainSource("variant?: 'page' | 'modal' | 'embedded'");
  });

  it('uses the home settings solid cyan style for settings action buttons', () => {
    const sources = [
      readSource('src/shared/settings/SystemSettingsModal.tsx'),
      readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx'),
      readSource('src/shared/navigation/NavSettingsModal.tsx'),
      readSource('src/features/tests/pages/DarkThemeColorPage.tsx'),
    ].join('\n');
    const sharedButtonClasses = readSource('src/shared/ui/actionButtonClasses.ts');

    expect(sources).toContainSource("import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';");
    expect(sources).toContainSource('PRIMARY_TEXT_BUTTON_CLASS');
    expect(sharedButtonClasses).toContainSource('rounded-md bg-[#08AACE]');
    expect(sharedButtonClasses).toContainSource('hover:bg-[#0798b8]');
    expect(sharedButtonClasses).toContainSource('text-white');
    expect(sources).toContainSource('SETTINGS_INLINE_BUTTON_CLASS');
    expect(sources).toContainSource('添加颜色');
    expect(sources).toContainSource('使用中');
    expect(sources).not.toContainSource("'rounded-lg border border-brand/20 bg-white px-3 py-2");
    expect(sources).not.toContainSource("'rounded-lg border border-brand/20 bg-white px-4 py-2");
    expect(sources).not.toContainSource('className={`flex items-center gap-1.5 ${SETTINGS_LIGHT_BUTTON_CLASS}`}');
    expect(sources).not.toContainSource('<RotateCcw className=');
  });

  it('keeps shortcut settings dense with header reset and solid cyan shortcut keys', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');
    const shortcutSettings = readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx');
    const sharedButtonClasses = readSource('src/shared/ui/actionButtonClasses.ts');

    expect(settingsPage).toContainSource('SHORTCUT_SETTINGS_RESET_EVENT');
    expect(settingsPage).toContainSource('SETTINGS_HEADER_ACTION_BUTTON_CLASS');
    expect(settingsPage).toContainSource("activeSection === 'shortcuts'");
    expect(settingsPage).toContainSource('window.dispatchEvent(new Event(SHORTCUT_SETTINGS_RESET_EVENT))');
    expect(settingsPage).toContainSource('border-b border-slate-100 bg-white px-6 pt-4');
    expect(settingsPage).toContainSource('SETTINGS_HEADER_ACTION_BUTTON_CLASS');

    expect(shortcutSettings).toContainSource(
      "export const SHORTCUT_SETTINGS_RESET_EVENT = 'xinyuexia_shortcut_settings_reset_requested'",
    );
    expect(shortcutSettings).toContainSource(
      'window.addEventListener(SHORTCUT_SETTINGS_RESET_EVENT, handleResetRequest)',
    );
    expect(shortcutSettings).toContainSource('grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5');
    expect(shortcutSettings).toContainSource('SHORTCUT_KEY_BUTTON_CLASS');
    expect(shortcutSettings).toContainSource('SHORTCUT_KEY_TEXT_BUTTON_CLASS');
    expect(sharedButtonClasses).toContainSource('export const SHORTCUT_KEY_TEXT_BUTTON_CLASS');
    expect(sharedButtonClasses).toContainSource('rounded-md bg-[#08AACE]');
    expect(shortcutSettings).not.toContainSource('bg-white text-slate-800 hover:bg-slate-100');
    expect(shortcutSettings).not.toContainSource('className="flex justify-end"');
    expect(shortcutSettings).not.toContainSource('className="hidden"');
  });

  it('records the unified settings migration in the in-app error log', () => {
    const errorLog = readErrorLogDefaultEntriesSource();

    expect(errorLog).toContainSource('dashboard-unified-settings-page-tree-001');
    expect(errorLog).toContainSource('settings-action-buttons-match-home-settings-001');
    expect(errorLog).toContainSource('shortcut-settings-four-column-header-reset-001');
    expect(errorLog).toContainSource('settings-wide-action-rows-waste-space-001');
    expect(errorLog).toContainSource('settings-remove-duplicate-section-banner-001');
    expect(errorLog).toContainSource('settings-four-column-left-aligned-grid-001');
    expect(errorLog).toContainSource('settings-data-migration-remove-repeated-title-001');
    expect(errorLog).toContainSource('shortcut-settings-five-column-grid-001');
    expect(errorLog).toContainSource('retire-text-overrides-and-consolidate-direct-routes-001');
    expect(errorLog).toContainSource('navigation-settings-left-work-area-001');
    expect(errorLog).toContainSource('data-migration-actions-match-new-novel-button-001');
    expect(errorLog).toContainSource('default-cover-two-column-dense-layout-001');
    expect(errorLog).toContainSource('default-cover-current-badge-without-selection-ring-001');
    expect(errorLog).toContainSource('default-cover-custom-history-library-001');
    expect(errorLog).toContainSource('move-association-and-app-icon-to-test-settings-001');
    expect(errorLog).toContainSource('retire-script-prompts-and-modal-category-create-001');
  });
});
