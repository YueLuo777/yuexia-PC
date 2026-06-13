import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('dashboard footer settings pages', () => {
  it('routes the four footer settings entries to pages instead of opening modals', () => {
    const dashboard = readSource('src/shared/layout/DashboardLayout.tsx');

    expect(dashboard).toContain('to="/system-settings"');
    expect(dashboard).toContain('to="/theme-colors"');
    expect(dashboard).toContain('to="/shortcut-settings"');
    expect(dashboard).toContain('to="/nav-settings"');

    expect(dashboard).not.toContain('setShowSystemSettings(true)');
    expect(dashboard).not.toContain('setShowThemeColors(true)');
    expect(dashboard).not.toContain('setShowShortcutSettings(true)');
    expect(dashboard).not.toContain('setShowNavSettings(true)');
    expect(dashboard).not.toContain('<SystemSettingsModal');
    expect(dashboard).not.toContain('<ShortcutSettingsModal');
    expect(dashboard).not.toContain('<NavSettingsModal');
    expect(dashboard).not.toContain('data-modal-id="dashboard-theme-colors"');
  });

  it('registers the settings destinations as dashboard routes', () => {
    const app = readSource('src/app/App.tsx');

    expect(app).toContain('SystemSettingsPage');
    expect(app).toContain('ShortcutSettingsPage');
    expect(app).toContain('NavSettingsPage');
    expect(app).toContain('path="/system-settings"');
    expect(app).toContain('path="/theme-colors"');
    expect(app).toContain('path="/shortcut-settings"');
    expect(app).toContain('path="/nav-settings"');
  });

  it('keeps page exports beside the former modal implementations', () => {
    expect(readSource('src/shared/settings/SystemSettingsModal.tsx')).toContain(
      'export function SystemSettingsPage',
    );
    expect(readSource('src/shared/shortcuts/ShortcutSettingsModal.tsx')).toContain(
      'export function ShortcutSettingsPage',
    );
    expect(readSource('src/shared/navigation/NavSettingsModal.tsx')).toContain(
      'export function NavSettingsPage',
    );
  });

  it('adds back buttons to the non-theme settings pages', () => {
    [
      'src/shared/settings/SystemSettingsModal.tsx',
      'src/shared/shortcuts/ShortcutSettingsModal.tsx',
      'src/shared/navigation/NavSettingsModal.tsx',
    ].forEach((path) => {
      const source = readSource(path);

      expect(source).toContain('flex h-9 w-9 items-center justify-center rounded-lg border transition-colors');
      expect(source).toContain('title="返回我的小说"');
      expect(source).toContain("navigate('/novels')");
    });
  });

  it('records the footer settings migration in the in-app error log', () => {
    const errorLog = readSource('src/features/tests/pages/ErrorLogPage.tsx');

    expect(errorLog).toContain('dashboard-footer-settings-pages-not-modals-001');
  });
});
