import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Camera, ChevronDown, ChevronRight, Keyboard, UserRound } from 'lucide-react';

import { NavSettingsModal } from '@/shared/navigation/NavSettingsModal';
import {
  getIconByName,
  loadCollapsedSections,
  loadNavConfig,
  normalizeNavConfig,
  resetNavConfig,
  saveCollapsedSections,
  saveNavConfig,
  type NavGroupConfig,
} from '@/shared/navigation/navConfig';
import { ShortcutSettingsModal } from '@/shared/shortcuts/ShortcutSettingsModal';
import { SystemSettingsModal } from '@/shared/settings/SystemSettingsModal';

const USER_NAME_KEY = 'xinyuexia_sidebar_user_name';
const USER_AVATAR_KEY = 'xinyuexia_sidebar_user_avatar';
const USER_NAME_UPDATED_EVENT = 'xinyuexia_user_name_updated';

function readUserName() {
  return localStorage.getItem(USER_NAME_KEY) || '月下作者';
}

function readUserAvatar() {
  return localStorage.getItem(USER_AVATAR_KEY) || '';
}

function resizeAvatar(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('头像读取失败'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('头像格式不支持'));
      image.onload = () => {
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('头像处理失败'));
          return;
        }

        const sourceSize = Math.min(image.width, image.height);
        const sx = (image.width - sourceSize) / 2;
        const sy = (image.height - sourceSize) / 2;
        context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  });
}

export function DashboardLayout() {
  const location = useLocation();
  const [navConfig, setNavConfig] = useState<NavGroupConfig[]>(() => normalizeNavConfig(loadNavConfig()));
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => loadCollapsedSections());
  const [showNavSettings, setShowNavSettings] = useState(false);
  const [showShortcutSettings, setShowShortcutSettings] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [userName, setUserName] = useState(readUserName);
  const [avatar, setAvatar] = useState(readUserAvatar);
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [userNameDraft, setUserNameDraft] = useState(userName);
  const sidebarRef = useRef<HTMLElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const saved = Number.parseInt(localStorage.getItem('xinyuexia_nav_scroll') ?? '0', 10);
    if (saved > 0) el.scrollTop = saved;
    const onScroll = () => localStorage.setItem('xinyuexia_nav_scroll', String(el.scrollTop));
    el.addEventListener('scroll', onScroll);
    return () => {
      localStorage.setItem('xinyuexia_nav_scroll', String(el.scrollTop));
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      saveCollapsedSections(next);
      return next;
    });
  }, []);

  const commitUserName = () => {
    const next = userNameDraft.trim() || '月下作者';
    setUserName(next);
    setUserNameDraft(next);
    localStorage.setItem(USER_NAME_KEY, next);
    window.dispatchEvent(new CustomEvent(USER_NAME_UPDATED_EVENT, { detail: { userName: next } }));
    setIsEditingUserName(false);
  };

  const handleAvatarFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const nextAvatar = await resizeAvatar(file);
    setAvatar(nextAvatar);
    localStorage.setItem(USER_AVATAR_KEY, nextAvatar);
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      <aside ref={sidebarRef} className="flex w-[198px] shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-slate-200 bg-white">
        <div className="shrink-0 border-b border-slate-100 px-3 py-2">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void handleAvatarFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <div className="flex items-center gap-3 px-3 py-2">
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-brand/50 hover:text-brand"
              title="点击上传头像"
            >
              {avatar ? (
                <img src={avatar} alt="用户头像" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-7 w-7" />
              )}
              <span className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex">
                <Camera className="h-5 w-5" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              {isEditingUserName ? (
                <input
                  value={userNameDraft}
                  onChange={(event) => setUserNameDraft(event.target.value)}
                  onBlur={commitUserName}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitUserName();
                    if (event.key === 'Escape') {
                      setUserNameDraft(userName);
                      setIsEditingUserName(false);
                    }
                  }}
                  maxLength={18}
                  autoFocus
                  className="h-9 w-full rounded-lg border border-brand bg-white px-2 text-[18px] font-bold text-slate-900 outline-none"
                />
              ) : (
                <button
                  onDoubleClick={() => {
                    setUserNameDraft(userName);
                    setIsEditingUserName(true);
                  }}
                  className="block max-w-full truncate text-left text-[18px] font-bold text-slate-800 transition-colors hover:text-brand"
                  title="双击修改用户名"
                >
                  {userName}
                </button>
              )}
            </div>
          </div>
        </div>

        {navConfig.filter((group) => !group.hidden).map((group) => {
          const GroupIcon = getIconByName(group.iconName);
          const isCollapsed = collapsedSections[group.title] ?? false;

          return (
            <div key={group.title} className="mb-1">
              <button
                onClick={() => toggleSection(group.title)}
                className="mx-1.5 mt-1.5 flex w-[calc(100%-12px)] items-center justify-between rounded-lg bg-brand-light px-3.5 py-2 font-medium text-brand-dark transition-colors hover:bg-brand/10"
                style={{ fontSize: '16px' }}
              >
                <span className="flex items-center gap-1.5">
                  <GroupIcon className="h-4 w-4" />
                  <span>{group.title}</span>
                </span>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {!isCollapsed && group.items.filter((item) => !item.hidden).map((item) => {
                const ItemIcon = getIconByName(item.iconName);
                const isActive = location.pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      isActive
                        ? 'border-l-[3px] border-orange-500 bg-orange-50 font-medium text-orange-500'
                        : 'border-l-[3px] border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ItemIcon className="h-[17px] w-[17px]" />
                    <span className="text-[15px] leading-none">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}

        <div className="mt-auto space-y-2 border-t border-slate-100 p-4">
          <button
            onClick={() => setShowSystemSettings(true)}
            className="flex w-full items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-700 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
          >
            系统设置
          </button>
          <button
            onClick={() => setShowShortcutSettings(true)}
            className="flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Keyboard className="h-4 w-4" />
            快捷键设置
          </button>
          <button
            onClick={() => setShowNavSettings(true)}
            className="flex w-full items-center justify-center whitespace-nowrap rounded-lg bg-brand px-3 py-2.5 text-[13px] text-white transition-colors hover:bg-brand-dark"
          >
            导航设置
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>

      <NavSettingsModal
        isOpen={showNavSettings}
        onClose={() => setShowNavSettings(false)}
        config={navConfig}
        onSave={(next) => {
          const saved = saveNavConfig(next);
          setNavConfig(saved);
        }}
        onReset={() => {
          const fresh = resetNavConfig();
          setNavConfig(fresh);
        }}
          />

      <ShortcutSettingsModal
        isOpen={showShortcutSettings}
        onClose={() => setShowShortcutSettings(false)}
      />
      <SystemSettingsModal
        isOpen={showSystemSettings}
        onClose={() => setShowSystemSettings(false)}
      />
    </div>
  );
}
