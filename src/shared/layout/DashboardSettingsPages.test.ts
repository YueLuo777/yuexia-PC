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
    expect(footerSource).toContain('to="/settings"');
    expect(footerSource).toContain('title="设置"');
    expect(footerSource).toContain('设置');
    expect(footerSource).toContain('className={SETTINGS_TEXT_BUTTON_CLASS}');
    expect(footerSource).not.toContain('to="/system-settings"');
    expect(footerSource).not.toContain('to="/theme-colors"');
    expect(footerSource).not.toContain('to="/shortcut-settings"');
    expect(footerSource).not.toContain('to="/nav-settings"');
  });

  it('uses the same solid cyan button tone as the chapter add-volume button for the settings entry', () => {
    const dashboard = readSource('src/shared/layout/DashboardLayout.tsx');
    const chapterSidebar = readSource('src/features/workbench/components/ChapterSidebar.tsx');

    expect(chapterSidebar).toContain("bg-[#08AACE] hover:bg-[#0798b8]");
    expect(dashboard).toContain("bg-[#08AACE]");
    expect(dashboard).toContain("hover:bg-[#0798b8]");
    expect(dashboard).toContain('text-white');
    expect(dashboard).not.toContain('border border-brand/20 bg-white px-2');
  });

  it('registers the unified settings route and redirects old settings URLs to sections', () => {
    const app = readSource('src/app/App.tsx');

    expect(app).toContain('SettingsPage');
    expect(app).toContain('path="/settings"');
    expect(app).toContain('to="/settings?section=system"');
    expect(app).toContain('to="/settings?section=shortcuts"');
    expect(app).toContain('to="/settings?section=theme"');
    expect(app).toContain('to="/settings?section=navigation"');
  });

  it('keeps the four settings areas inside the unified settings shell', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');

    expect(settingsPage).toContain("type SettingsSection = 'system' | 'shortcuts' | 'theme' | 'navigation'");
    expect(settingsPage).toContain("id: 'system'");
    expect(settingsPage).toContain("id: 'shortcuts'");
    expect(settingsPage).toContain("id: 'theme'");
    expect(settingsPage).toContain("id: 'navigation'");
    expect(settingsPage).toContain('variant="embedded"');
    expect(settingsPage).toContain('w-[236px]');
    expect(settingsPage).toContain('bg-white px-5 py-4');
  });

  it('keeps settings pages plain and exposes window size memory', () => {
    const systemSettings = readSource('src/shared/settings/SystemSettingsModal.tsx');
    const shortcutSettings = readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx');
    const navSettings = readSource('src/shared/navigation/NavSettingsModal.tsx');
    const themeSettings = readSource('src/features/tests/pages/DarkThemeColorPage.tsx');
    const electronMain = readSource('electron/main.cjs');

    expect(systemSettings).toContain("type SettingsTab = 'window' | 'association' | 'appIcon'");
    expect(systemSettings).toContain('window.xinyuexiaWindow.updateSettings');
    expect(systemSettings).toContain("'bg-[#08AACE] text-white shadow-sm'");
    expect(systemSettings).toContain("hover:bg-[#E7F8FD] hover:text-[#08AACE]");
    expect(electronMain).toContain("ipcMain.handle('window-settings:update'");
    expect(electronMain).toContain('if (!readWindowSettings().rememberSize) return null;');

    expect(shortcutSettings).toContain("variant?: 'modal' | 'page' | 'embedded'");
    expect(navSettings).toContain("variant?: 'modal' | 'page' | 'embedded'");
    expect(themeSettings).toContain("variant?: 'page' | 'modal' | 'embedded'");
  });

  it('uses the home settings solid cyan style for settings action buttons', () => {
    const sources = [
      readSource('src/shared/settings/SystemSettingsModal.tsx'),
      readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx'),
      readSource('src/shared/navigation/NavSettingsModal.tsx'),
      readSource('src/features/tests/pages/DarkThemeColorPage.tsx'),
    ].join('\n');

    expect(sources).toContain('rounded-md bg-[#08AACE]');
    expect(sources).toContain('hover:bg-[#0798b8]');
    expect(sources).toContain('text-white');
    expect(sources).toContain('SETTINGS_INLINE_BUTTON_CLASS');
    expect(sources).toContain('添加颜色');
    expect(sources).toContain('使用中');
    expect(sources).not.toContain("'rounded-lg border border-brand/20 bg-white px-3 py-2");
    expect(sources).not.toContain("'rounded-lg border border-brand/20 bg-white px-4 py-2");
    expect(sources).not.toContain('className={`flex items-center gap-1.5 ${SETTINGS_LIGHT_BUTTON_CLASS}`}');
    expect(sources).not.toContain('<RotateCcw className=');
  });

  it('keeps shortcut settings dense with header reset and solid cyan shortcut keys', () => {
    const settingsPage = readSource('src/shared/settings/SettingsPage.tsx');
    const shortcutSettings = readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx');

    expect(settingsPage).toContain('SHORTCUT_SETTINGS_RESET_EVENT');
    expect(settingsPage).toContain('SETTINGS_HEADER_ACTION_BUTTON_CLASS');
    expect(settingsPage).toContain("activeSection === 'shortcuts'");
    expect(settingsPage).toContain('window.dispatchEvent(new Event(SHORTCUT_SETTINGS_RESET_EVENT))');
    expect(settingsPage).toContain('relative shrink-0 border-b');
    expect(settingsPage).toContain('absolute right-5 top-1/2 -translate-y-1/2');

    expect(shortcutSettings).toContain("export const SHORTCUT_SETTINGS_RESET_EVENT = 'xinyuexia_shortcut_settings_reset_requested'");
    expect(shortcutSettings).toContain('window.addEventListener(SHORTCUT_SETTINGS_RESET_EVENT, handleResetRequest)');
    expect(shortcutSettings).toContain('grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
    expect(shortcutSettings).toContain('SHORTCUT_KEY_BUTTON_CLASS');
    expect(shortcutSettings).toContain('rounded-md bg-[#08AACE]');
    expect(shortcutSettings).not.toContain('bg-white text-slate-800 hover:bg-slate-100');
    expect(shortcutSettings).not.toContain('className="flex justify-end"');
    expect(shortcutSettings).not.toContain('className="hidden"');
  });

  it('records the unified settings migration in the in-app error log', () => {
    const errorLog = readSource('src/features/tests/model/errorLogDefaultEntries.generated.ts');

    expect(errorLog).toContain('dashboard-unified-settings-page-tree-001');
    expect(errorLog).toContain('settings-action-buttons-match-home-settings-001');
    expect(errorLog).toContain('shortcut-settings-four-column-header-reset-001');
  });
});
