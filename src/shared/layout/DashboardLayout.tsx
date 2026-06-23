import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Camera, UserRound } from 'lucide-react';

import { TEST_COLLECTION_SHOW_INDEX_EVENT } from '@/features/tests/model/testCollectionEvents';
import {
  NAV_CONFIG_UPDATED_EVENT,
  getIconByName,
  loadNavConfig,
  normalizeNavConfig,
  type NavGroupConfig,
} from '@/shared/navigation/navConfig';

const USER_NAME_KEY = 'xinyuexia_sidebar_user_name';
const USER_AVATAR_KEY = 'xinyuexia_sidebar_user_avatar';
const USER_NAME_UPDATED_EVENT = 'xinyuexia_user_name_updated';
const SETTINGS_TEXT_BUTTON_CLASS =
  'flex h-8 min-w-0 items-center justify-center rounded-md border border-[#dfe5ee] bg-white/60 px-2 text-[12px] font-medium text-[#586574] shadow-sm transition-colors hover:border-[#cfd8e6] hover:bg-white hover:text-[#1f2933] focus-visible:border-[#08B3D9] focus-visible:bg-white focus-visible:outline-none';
const DASHBOARD_SIDEBAR_WIDTH_KEY = 'xinyuexia_dashboard_sidebar_width';
const DASHBOARD_SIDEBAR_DEFAULT_WIDTH = 224;
const DASHBOARD_SIDEBAR_MIN_WIDTH = 176;
const DASHBOARD_SIDEBAR_MAX_WIDTH = 340;

function clampDashboardSidebarWidth(width: number) {
  if (!Number.isFinite(width)) return DASHBOARD_SIDEBAR_DEFAULT_WIDTH;
  return Math.min(DASHBOARD_SIDEBAR_MAX_WIDTH, Math.max(DASHBOARD_SIDEBAR_MIN_WIDTH, Math.round(width)));
}

function readDashboardSidebarWidth() {
  const saved = Number.parseInt(
    localStorage.getItem(DASHBOARD_SIDEBAR_WIDTH_KEY) ?? String(DASHBOARD_SIDEBAR_DEFAULT_WIDTH),
    10,
  );
  return clampDashboardSidebarWidth(saved);
}

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
  const [userName, setUserName] = useState(readUserName);
  const [avatar, setAvatar] = useState(readUserAvatar);
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [userNameDraft, setUserNameDraft] = useState(userName);
  const [isSidebarScrolling, setIsSidebarScrolling] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(readDashboardSidebarWidth);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const sidebarScrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const saved = Number.parseInt(localStorage.getItem('xinyuexia_nav_scroll') ?? '0', 10);
    if (saved > 0) el.scrollTop = saved;
    const saveScroll = () => localStorage.setItem('xinyuexia_nav_scroll', String(el.scrollTop));
    const onScroll = () => {
      setIsSidebarScrolling(true);
      if (sidebarScrollTimerRef.current !== null) window.clearTimeout(sidebarScrollTimerRef.current);
      sidebarScrollTimerRef.current = window.setTimeout(() => {
        saveScroll();
        setIsSidebarScrolling(false);
        sidebarScrollTimerRef.current = null;
      }, 650);
    };
    el.addEventListener('scroll', onScroll);
    return () => {
      if (sidebarScrollTimerRef.current !== null) window.clearTimeout(sidebarScrollTimerRef.current);
      saveScroll();
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const reloadNavConfig = () => setNavConfig(normalizeNavConfig(loadNavConfig()));
    window.addEventListener(NAV_CONFIG_UPDATED_EVENT, reloadNavConfig);
    window.addEventListener('storage', reloadNavConfig);
    return () => {
      window.removeEventListener(NAV_CONFIG_UPDATED_EVENT, reloadNavConfig);
      window.removeEventListener('storage', reloadNavConfig);
    };
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

  const persistSidebarWidth = useCallback((width: number) => {
    const nextWidth = clampDashboardSidebarWidth(width);
    setSidebarWidth(nextWidth);
    localStorage.setItem(DASHBOARD_SIDEBAR_WIDTH_KEY, String(nextWidth));
  }, []);

  const handleSidebarResizeStart = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = sidebarWidth;
    let nextWidth = startWidth;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const finishResize = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleWindowBlur);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      persistSidebarWidth(nextWidth);
    };

    const calculateNextWidth = (clientX: number) => clampDashboardSidebarWidth(startWidth + clientX - startX);

    function handleMouseMove(moveEvent: MouseEvent) {
      nextWidth = calculateNextWidth(moveEvent.clientX);
      setSidebarWidth(nextWidth);
    }

    function handleMouseUp(upEvent: MouseEvent) {
      nextWidth = calculateNextWidth(upEvent.clientX);
      finishResize();
    }

    function handleWindowBlur() {
      finishResize();
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleWindowBlur);
  }, [persistSidebarWidth, sidebarWidth]);

  const handleSidebarResizeKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 24 : 12;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      persistSidebarWidth(sidebarWidth - step);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      persistSidebarWidth(sidebarWidth + step);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      persistSidebarWidth(DASHBOARD_SIDEBAR_MIN_WIDTH);
    }
    if (event.key === 'End') {
      event.preventDefault();
      persistSidebarWidth(DASHBOARD_SIDEBAR_MAX_WIDTH);
    }
  }, [persistSidebarWidth, sidebarWidth]);

  const visibleNavItems = navConfig.flatMap((group) => (
    group.items.map((item) => ({
      ...item,
      hidden: item.hidden || group.hidden,
    }))
  )).filter((item) => !item.hidden);
  const navDividerAfterItemTos = new Set(navConfig[0]?.dividerAfterItemTos ?? (
    navConfig[0]?.dividerAfterItemTo ? [navConfig[0].dividerAfterItemTo] : []
  ));

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <aside
        style={{ width: sidebarWidth }}
        className="xy-dashboard-sidebar flex shrink-0 flex-col overflow-hidden border-r border-[#e1e5eb]"
      >
        <div className="shrink-0 border-b border-[#e1e5eb] px-3 py-[14px]">
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
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4dae3] bg-white text-slate-400 shadow-sm transition-colors hover:border-brand/50 hover:text-brand"
              title="点击上传头像"
            >
              {avatar ? (
                <img src={avatar} alt="用户头像" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-6 w-6" />
              )}
              <span className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex">
                <Camera className="h-4 w-4" />
              </span>
            </button>

            <div className="mt-3 w-full min-w-0">
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
                  className="mx-auto h-8 w-full max-w-[160px] rounded-md border border-brand bg-white px-2 text-center text-[15px] font-medium text-[#1f2933] outline-none"
                />
              ) : (
                <button
                  onDoubleClick={() => {
                    setUserNameDraft(userName);
                    setIsEditingUserName(true);
                  }}
                  className="mx-auto block max-w-[170px] truncate text-center text-[15px] font-medium text-[#1f2933] transition-colors hover:text-brand"
                  title="双击修改用户名"
                >
                  {userName}
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          ref={sidebarRef}
          className={`scrollbar-scroll-only min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${isSidebarScrolling ? 'scrollbar-active' : ''}`}
        >
          <div className="space-y-1 px-1.5 py-1">
            {visibleNavItems.map((item) => {
              const ItemIcon = getIconByName(item.iconName);
              const isActive = location.pathname === item.to;

              return (
                <div key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => {
                      if (item.to === '/test-collection' && location.pathname === '/test-collection') {
                        window.dispatchEvent(new Event(TEST_COLLECTION_SHOW_INDEX_EVENT));
                      }
                    }}
                    className={`flex h-10 items-center gap-3 rounded-md px-4 transition-colors ${
                      isActive
                        ? 'xy-dashboard-sidebar-active font-black text-[#142033]'
                        : 'font-bold text-[#354154] hover:bg-white/70 hover:text-[#142033]'
                    }`}
                  >
                    <ItemIcon className={`h-[18px] w-[18px] stroke-[2.4] ${isActive ? 'text-[#1e71ef]' : 'text-[#4d5b6c]'}`} />
                    <span className="text-[15px] leading-none">{item.label}</span>
                  </Link>
                  {navDividerAfterItemTos.has(item.to) ? (
                    <div aria-hidden="true" className="mx-3 my-2 border-t border-[#e1e5eb]" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="xy-dashboard-sidebar-footer shrink-0 border-t border-[#e1e5eb] p-3">
          <div
            data-testid="dashboard-footer-settings-group"
            className="grid grid-cols-2 gap-1.5"
          >
            <Link
              to="/system-settings"
              className={SETTINGS_TEXT_BUTTON_CLASS}
              title="系统设置"
            >
              系统设置
            </Link>
            <Link
              to="/theme-colors"
              className={SETTINGS_TEXT_BUTTON_CLASS}
              title="主题颜色"
            >
              主题颜色
            </Link>
            <Link
              to="/shortcut-settings"
              className={SETTINGS_TEXT_BUTTON_CLASS}
              title="快捷键"
            >
              快捷键
            </Link>
            <Link
              to="/nav-settings"
              className={SETTINGS_TEXT_BUTTON_CLASS}
              title="导航设置"
            >
              导航设置
            </Link>
          </div>
        </div>
      </aside>

      <div
        data-no-modal-drag="true"
        role="separator"
        aria-label="调整左侧导航宽度"
        aria-orientation="vertical"
        aria-valuemin={DASHBOARD_SIDEBAR_MIN_WIDTH}
        aria-valuemax={DASHBOARD_SIDEBAR_MAX_WIDTH}
        aria-valuenow={sidebarWidth}
        tabIndex={0}
        className="group relative z-10 -ml-[3px] -mr-[3px] flex w-[6px] shrink-0 cursor-ew-resize items-stretch justify-center bg-transparent outline-none"
        onMouseDown={handleSidebarResizeStart}
        onKeyDown={handleSidebarResizeKeyDown}
        title="拖拽调整左侧导航宽度"
      >
        <div className="h-full w-px bg-[#1E71EF] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </div>

      <main className="min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
