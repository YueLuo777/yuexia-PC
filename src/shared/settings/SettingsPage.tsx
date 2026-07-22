import { useEffect, useState } from 'react';
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
import { DefaultCoverSettingsPage } from '@/shared/settings/DefaultCoverSettingsPage';
import { SystemSettingsModal } from '@/shared/settings/SystemSettingsModal';
import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';
import { SettingsSurface } from '@/shared/ui/SettingsSurface';

type SettingsSection =
  | 'system'
  | 'backup'
  | 'shortcuts'
  | 'theme'
  | 'association'
  | 'appIcon'
  | 'navigation'
  | 'defaultCover';
type SettingsMode = 'user' | 'test';

const SETTINGS_HEADER_ACTION_BUTTON_CLASS = PRIMARY_TEXT_BUTTON_CLASS;

type SettingsNavItem = {
  id: SettingsSection;
  label: string;
  description: string;
};

const USER_SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { id: 'system', label: '系统设置', description: '窗口大小和记忆' },
  { id: 'backup', label: '数据迁移', description: '全局导出、导入和恢复' },
  { id: 'shortcuts', label: '快捷键设置', description: '键盘快捷键和鼠标手势' },
  { id: 'navigation', label: '导航设置', description: '左侧导航显示和排序' },
  { id: 'defaultCover', label: '默认封面设置', description: '选择小说的默认封面' },
];

const TEST_SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { id: 'association', label: '关联设置', description: '控制关闭软件后是否保持关联' },
  { id: 'appIcon', label: '软件图标', description: '桌面图标切换与恢复' },
  { id: 'theme', label: '主题颜色', description: '软件配色和主题色板' },
];

const SETTINGS_NAV_GROUPS = [
  { id: 'user', label: '用户设置', items: USER_SETTINGS_NAV_ITEMS },
  { id: 'test', label: '测试设置', items: TEST_SETTINGS_NAV_ITEMS },
] as const;

const SETTINGS_NAV_ITEMS = SETTINGS_NAV_GROUPS.flatMap((group) => group.items);

function normalizeSettingsSection(value: string | null): SettingsSection {
  if (
    value === 'backup' ||
    value === 'shortcuts' ||
    value === 'theme' ||
    value === 'association' ||
    value === 'appIcon' ||
    value === 'navigation' ||
    value === 'defaultCover'
  )
    return value;
  return 'system';
}

function isTestSettingsSection(section: SettingsSection) {
  return TEST_SETTINGS_NAV_ITEMS.some((item) => item.id === section);
}

function readHomeAvatar() {
  return localStorage.getItem('xinyuexia_sidebar_user_avatar') || '';
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SettingsSection>(() =>
    normalizeSettingsSection(searchParams.get('section')),
  );
  const [settingsMode, setSettingsMode] = useState<SettingsMode>(() =>
    isTestSettingsSection(normalizeSettingsSection(searchParams.get('section'))) ? 'test' : 'user',
  );
  const [homeAvatar, setHomeAvatar] = useState(readHomeAvatar);
  const [navConfig, setNavConfig] = useState<NavGroupConfig[]>(() => normalizeNavConfig(loadNavConfig()));

  useEffect(() => {
    const section = normalizeSettingsSection(searchParams.get('section'));
    setActiveSection(section);
    setSettingsMode(isTestSettingsSection(section) ? 'test' : 'user');
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

  const selectSection = (section: SettingsSection) => {
    setActiveSection(section);
    setSettingsMode(isTestSettingsSection(section) ? 'test' : 'user');
    setSearchParams({ section });
  };

  const selectMode = (mode: SettingsMode) => {
    setSettingsMode(mode);
    const firstItem = mode === 'user' ? USER_SETTINGS_NAV_ITEMS[0] : TEST_SETTINGS_NAV_ITEMS[0];
    selectSection(firstItem.id);
  };

  const resetShortcutSettings = () => {
    window.dispatchEvent(new Event(SHORTCUT_SETTINGS_RESET_EVENT));
  };

  const visibleItems = settingsMode === 'user' ? USER_SETTINGS_NAV_ITEMS : TEST_SETTINGS_NAV_ITEMS;

  return (
    <SettingsSurface mode="embedded" className="bg-white">
      <div className="flex h-full min-h-0 flex-col">
        <header className="shrink-0 border-b border-slate-100 bg-white px-6 pt-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-black text-slate-950">设置</h1>
            <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-black">
              {(['user', 'test'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => selectMode(mode)}
                  aria-pressed={settingsMode === mode}
                  className={`rounded-lg px-4 py-2 transition-colors ${
                    settingsMode === mode ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {mode === 'user' ? '用户设置' : '测试设置'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <nav
              className="flex min-w-0 gap-1.5 overflow-x-auto"
              aria-label={`${settingsMode === 'user' ? '用户' : '测试'}设置顶部导航`}
            >
              {visibleItems.map((item) => {
                const active = item.id === activeSection;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectSection(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`h-10 whitespace-nowrap border-b-2 px-4 text-sm font-black transition-colors ${
                      active
                        ? 'border-[#A9EAF5] text-[#08AACE]'
                        : 'border-transparent text-slate-500 hover:text-[#08AACE]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
            {activeSection === 'shortcuts' ? (
              <button
                type="button"
                onClick={resetShortcutSettings}
                className={`${SETTINGS_HEADER_ACTION_BUTTON_CLASS} mb-1 shrink-0`}
              >
                恢复默认
              </button>
            ) : null}
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-3">
          {activeSection === 'system' && (
            <SystemSettingsModal
              isOpen
              onClose={() => undefined}
              homeAvatar={homeAvatar}
              variant="embedded"
              activeTab="window"
              hideTabNavigation
            />
          )}
          {activeSection === 'association' && (
            <SystemSettingsModal
              isOpen
              onClose={() => undefined}
              homeAvatar={homeAvatar}
              variant="embedded"
              activeTab="association"
              hideTabNavigation
            />
          )}
          {activeSection === 'appIcon' && (
            <SystemSettingsModal
              isOpen
              onClose={() => undefined}
              homeAvatar={homeAvatar}
              variant="embedded"
              activeTab="appIcon"
              hideTabNavigation
            />
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
          {activeSection === 'defaultCover' && <DefaultCoverSettingsPage />}
        </section>
      </div>
    </SettingsSurface>
  );
}
