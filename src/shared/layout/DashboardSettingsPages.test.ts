import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

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

    expect(app).toContainSource('SettingsPage');
    expect(app).toContainSource('path="/settings"');
    expect(app).toContainSource('to="/settings?section=system"');
    expect(app).toContainSource('to="/settings?section=shortcuts"');
    expect(internalRoutes).toContainSource('to="/settings?section=theme"');
    expect(app).toContainSource('to="/settings?section=navigation"');
  });

  it('keeps the four settings areas inside the unified settings shell', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');

    expect(settingsPage).toContainSource(
      "type SettingsSection = 'system' | 'backup' | 'shortcuts' | 'theme' | 'navigation'",
    );
    expect(settingsPage).toContainSource("id: 'system'");
    expect(settingsPage).toContainSource("id: 'backup'");
    expect(settingsPage).toContainSource('数据迁移');
    expect(settingsPage).toContainSource('DbSettingsPage');
    expect(settingsPage).toContainSource("id: 'shortcuts'");
    expect(settingsPage).toContainSource("id: 'theme'");
    expect(settingsPage).toContainSource("id: 'navigation'");
    expect(settingsPage).toContainSource('variant="embedded"');
    expect(settingsPage).toContainSource('w-[236px]');
    expect(settingsPage).toContainSource('bg-white px-5 py-4');
  });

  it('keeps settings pages plain and exposes window size memory', () => {
    const systemSettings = readSource('src/shared/settings/SystemSettingsModal.tsx');
    const shortcutSettings = readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx');
    const navSettings = readSource('src/shared/navigation/NavSettingsModal.tsx');
    const themeSettings = readSource('src/features/tests/pages/DarkThemeColorPage.tsx');
    const electronMain = readSource('electron/main.cjs');
    const sharedButtonClasses = readSource('src/shared/ui/actionButtonClasses.ts');

    expect(systemSettings).toContainSource("type SettingsTab = 'window' | 'association' | 'appIcon'");
    expect(systemSettings).toContainSource('window.xinyuexiaWindow.updateSettings');
    expect(systemSettings).toContainSource(
      "import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';",
    );
    expect(systemSettings).toContainSource('PRIMARY_TEXT_BUTTON_CLASS');
    expect(sharedButtonClasses).toContainSource('bg-[#08AACE]');
    expect(sharedButtonClasses).toContainSource('hover:bg-[#0798b8]');
    expect(electronMain).toContainSource("registerTrustedIpcHandler('window-settings:update'");
    expect(electronMain).toContainSource('if (!readWindowSettings().rememberSize) return null;');

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
    expect(settingsPage).toContainSource('relative shrink-0 border-b');
    expect(settingsPage).toContainSource('absolute right-5 top-1/2 -translate-y-1/2');

    expect(shortcutSettings).toContainSource(
      "export const SHORTCUT_SETTINGS_RESET_EVENT = 'xinyuexia_shortcut_settings_reset_requested'",
    );
    expect(shortcutSettings).toContainSource(
      'window.addEventListener(SHORTCUT_SETTINGS_RESET_EVENT, handleResetRequest)',
    );
    expect(shortcutSettings).toContainSource('grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
    expect(shortcutSettings).toContainSource('SHORTCUT_KEY_BUTTON_CLASS');
    expect(shortcutSettings).toContainSource('SHORTCUT_KEY_TEXT_BUTTON_CLASS');
    expect(sharedButtonClasses).toContainSource('export const SHORTCUT_KEY_TEXT_BUTTON_CLASS');
    expect(sharedButtonClasses).toContainSource('rounded-md bg-[#08AACE]');
    expect(shortcutSettings).not.toContainSource('bg-white text-slate-800 hover:bg-slate-100');
    expect(shortcutSettings).not.toContainSource('className="flex justify-end"');
    expect(shortcutSettings).not.toContainSource('className="hidden"');
  });

  it('records the unified settings migration in the in-app error log', () => {
    const errorLog = readSource('src/features/tests/model/errorLogDefaultEntries.generated.ts');

    expect(errorLog).toContainSource('dashboard-unified-settings-page-tree-001');
    expect(errorLog).toContainSource('settings-action-buttons-match-home-settings-001');
    expect(errorLog).toContainSource('shortcut-settings-four-column-header-reset-001');
  });
});
