import { DatabaseBackup, Keyboard, Palette, Route, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DarkThemeColorPage } from '@/features/tests/pages/DarkThemeColorPage';
import { DbSettingsPage } from '@/features/settings/pages/DbSettingsPage';
import { NavSettingsModal } from '@/shared/navigation/NavSettingsModal';
import {
  NAV_CONFIG_UPDATED_EVENT,
  loadNavConfig,
  normalizeNavConfig,
  resetNavConfig,
  saveNavConfig,
  type NavGroupConfig,
} from '@/shared/navigation/navConfig';
import { SHORTCUT_SETTINGS_RESET_EVENT, ShortcutSettingsModal } from '@/shared/shortcuts/ShortcutSettingsModal';
import { SystemSettingsModal } from '@/shared/settings/SystemSettingsModal';
import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';
import { SettingsSurface } from '@/shared/ui/SettingsSurface';

type SettingsSection = 'system' | 'backup' | 'shortcuts' | 'theme' | 'navigation';

const SETTINGS_HEADER_ACTION_BUTTON_CLASS = PRIMARY_TEXT_BUTTON_CLASS;

const SETTINGS_NAV_ITEMS: Array<{
  id: SettingsSection;
  label: string;
  description: string;
  icon: typeof Settings;
}> = [
  { id: 'system', label: '系统设置', description: '窗口、关联、软件图标', icon: Settings },
  { id: 'backup', label: '数据迁移', description: '全局导出、导入和恢复', icon: DatabaseBackup },
  { id: 'shortcuts', label: '快捷键设置', description: '键盘快捷键和鼠标手势', icon: Keyboard },
  { id: 'theme', label: '主题颜色', description: '软件配色和主题色板', icon: Palette },
  { id: 'navigation', label: '导航设置', description: '左侧导航显示和排序', icon: Route },
];

function normalizeSettingsSection(value: string | null): SettingsSection {
  if (value === 'backup' || value === 'shortcuts' || value === 'theme' || value === 'navigation') return value;
  return 'system';
}

function readHomeAvatar() {
  return localStorage.getItem('xinyuexia_sidebar_user_avatar') || '';
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SettingsSection>(() =>
    normalizeSettingsSection(searchParams.get('section')),
  );
  const [homeAvatar, setHomeAvatar] = useState(readHomeAvatar);
  const [navConfig, setNavConfig] = useState<NavGroupConfig[]>(() => normalizeNavConfig(loadNavConfig()));

  useEffect(() => {
    setActiveSection(normalizeSettingsSection(searchParams.get('section')));
  }, [searchParams]);

  useEffect(() => {
    const refreshHomeAvatar = () => setHomeAvatar(readHomeAvatar());
    window.addEventListener('storage', refreshHomeAvatar);
    return () => window.removeEventListener('storage', refreshHomeAvatar);
  }, []);

  useEffect(() => {
    const reloadConfig = () => setNavConfig(normalizeNavConfig(loadNavConfig()));
    window.addEventListener(NAV_CONFIG_UPDATED_EVENT, reloadConfig);
    window.addEventListener('storage', reloadConfig);
    return () => {
      window.removeEventListener(NAV_CONFIG_UPDATED_EVENT, reloadConfig);
      window.removeEventListener('storage', reloadConfig);
    };
  }, []);

  const activeNavItem = useMemo(
    () => SETTINGS_NAV_ITEMS.find((item) => item.id === activeSection) ?? SETTINGS_NAV_ITEMS[0],
    [activeSection],
  );
  const ActiveIcon = activeNavItem.icon;

  const selectSection = (section: SettingsSection) => {
    setActiveSection(section);
    setSearchParams({ section });
  };

  const resetShortcutSettings = () => {
    window.dispatchEvent(new Event(SHORTCUT_SETTINGS_RESET_EVENT));
  };

  return (
    <SettingsSurface mode="embedded" className="flex bg-white">
      <aside className="w-[236px] shrink-0 border-r border-slate-200 bg-white px-3 py-3">
        <div className="mb-4 px-1">
          <h1 className="text-2xl font-black text-slate-950">设置</h1>
        </div>
        <nav className="space-y-2">
          {SETTINGS_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectSection(item.id)}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-md px-3 text-left transition-colors ${
                  active
                    ? 'bg-[#08AACE] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-[#E7F8FD] hover:text-[#08AACE]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-black leading-5">{item.label}</span>
                  <span
                    className={`mt-0.5 block truncate text-xs font-bold ${active ? 'text-white/80' : 'text-slate-400'}`}
                  >
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">
          <header className="relative shrink-0 border-b border-slate-200 bg-white px-5 py-3 pr-6">
            <div className="flex min-h-[42px] items-center">
              <div className="flex min-w-0 max-w-[calc(100%-136px)] items-center gap-3">
                <ActiveIcon className="h-5 w-5 shrink-0 text-[#08AACE]" />
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-slate-950">{activeNavItem.label}</h2>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-400">{activeNavItem.description}</p>
                </div>
              </div>
              {activeSection === 'shortcuts' ? (
                <button
                  type="button"
                  onClick={resetShortcutSettings}
                  className={`${SETTINGS_HEADER_ACTION_BUTTON_CLASS} absolute right-5 top-1/2 -translate-y-1/2`}
                >
                  恢复默认
                </button>
              ) : null}
            </div>
          </header>

          <section className="min-h-0 flex-1 overflow-hidden bg-white px-5 py-4">
            {activeSection === 'system' && (
              <SystemSettingsModal isOpen onClose={() => undefined} homeAvatar={homeAvatar} variant="embedded" />
            )}
            {activeSection === 'backup' && <DbSettingsPage />}
            {activeSection === 'shortcuts' && (
              <ShortcutSettingsModal isOpen onClose={() => undefined} variant="embedded" />
            )}
            {activeSection === 'theme' && <DarkThemeColorPage variant="embedded" />}
            {activeSection === 'navigation' && (
              <NavSettingsModal
                isOpen
                onClose={() => undefined}
                config={navConfig}
                onSave={(next) => setNavConfig(saveNavConfig(next))}
                onReset={() => setNavConfig(resetNavConfig())}
                variant="embedded"
              />
            )}
          </section>
        </div>
      </main>
    </SettingsSurface>
  );
}
