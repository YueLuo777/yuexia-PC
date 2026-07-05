import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { useDraggableModal } from '@/shared/hooks/useDraggableModal';
import { ModalResizeHandles } from '@/shared/ui/ModalResizeHandles';
import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';

type SettingsTab = 'window' | 'association' | 'appIcon';

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'window', label: '窗口' },
  { id: 'association', label: '关联设置' },
  { id: 'appIcon', label: '软件图标' },
];

const USER_AVATAR_KEY = 'xinyuexia_sidebar_user_avatar';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeAvatar?: string;
  variant?: 'modal' | 'page' | 'embedded';
}

function readHomeAvatar() {
  return localStorage.getItem(USER_AVATAR_KEY) || '';
}

const SETTINGS_LIGHT_BUTTON_CLASS =
  PRIMARY_TEXT_BUTTON_CLASS;
const SETTINGS_PAGE_BACK_BUTTON_CLASS =
  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors border-brand/20 bg-white text-brand hover:bg-brand-light';
const SETTINGS_PAGE_SHELL_CLASS =
  'mx-auto flex h-full w-full max-w-[1040px] flex-col overflow-hidden';
const SETTINGS_PAGE_BODY_CLASS =
  'grid min-h-0 flex-1 grid-cols-[180px_minmax(0,1fr)] gap-6 pt-4';
const SETTINGS_PAGE_NAV_CLASS =
  'shrink-0 border-r border-slate-100 pr-4';
const SETTINGS_PAGE_CONTENT_CLASS =
  'min-w-0 overflow-y-auto px-1 pb-6';

export function SystemSettingsModal({ isOpen, onClose, homeAvatar = '', variant = 'modal' }: SystemSettingsModalProps) {
  const isPage = variant === 'page';
  const isEmbedded = variant === 'embedded';
  const isRouteSurface = isPage || isEmbedded;
  useTopModalEscape(!isRouteSurface && isOpen, onClose);
  const draggable = useDraggableModal('dashboard_system_settings', { x: 0, y: 0, width: 936, height: 720 });
  const [activeTab, setActiveTab] = useState<SettingsTab>('window');
  const [iconInfo, setIconInfo] = useState<AppIconResult | null>(null);
  const [windowSettings, setWindowSettings] = useState<WindowSettingsResult | null>(null);
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const fallbackIconDir = 'E:\\0yuexia\\0,月下PC\\ruanjianfengmian';
  const iconDir = iconInfo?.projectIconDir ?? fallbackIconDir;
  const projectIcons = iconInfo?.projectIcons ?? [];
  const supportsProjectIconList = Array.isArray(iconInfo?.projectIcons);

  const refreshIconInfo = async () => {
    const result = await window.xinyuexiaAppIcon?.read();
    if (result) setIconInfo(result);
  };

  const refreshWindowSettings = async () => {
    const result = await window.xinyuexiaWindow?.readSettings();
    if (result) setWindowSettings(result);
  };

  useEffect(() => {
    if (!isOpen) return;
    setStatus('');
    setActiveTab('window');
    void refreshIconInfo();
    void refreshWindowSettings();
  }, [isOpen]);

  if (!isOpen) return null;

  const selectIcon = async () => {
    if (!window.xinyuexiaAppIcon) {
      setStatus(`当前运行环境不支持直接上传。可以把图片放到 ${iconDir}，然后重启软件。`);
      return;
    }
    setIsBusy(true);
    const result = await window.xinyuexiaAppIcon.select();
    setIsBusy(false);
    if (result.canceled) return;
    setIconInfo(result);
    setStatus(result.message ?? (result.ok ? '图标已更新。' : '图标更新失败。'));
  };

  const applyProjectIcon = async (fileName: string) => {
    if (!window.xinyuexiaAppIcon) {
      setStatus('当前运行环境不支持切换软件图标。');
      return;
    }
    setIsBusy(true);
    const result = await window.xinyuexiaAppIcon.useProjectIcon(fileName);
    setIsBusy(false);
    setIconInfo(result);
    setStatus(result.message ?? (result.ok ? '软件图标已切换。' : '切换图标失败。'));
  };

  const resetIcon = async () => {
    if (!window.xinyuexiaAppIcon) {
      setStatus(`当前运行环境不支持直接恢复。请删除 ${iconDir} 里的自定义图标文件，然后重启软件。`);
      return;
    }
    setIsBusy(true);
    const result = await window.xinyuexiaAppIcon.reset();
    setIsBusy(false);
    setIconInfo(result);
    setStatus(result.message ?? (result.ok ? '已恢复默认图标。' : '恢复失败。'));
  };

  const useHomeAvatarIcon = async () => {
    if (!homeAvatar) {
      setStatus('首页图标为空，请先在首页左上角上传图标。');
      return;
    }
    if (!window.xinyuexiaAppIcon?.useDataUrl) {
      setStatus('当前运行环境不支持将首页图标设置为软件图标。');
      return;
    }
    setIsBusy(true);
    const result = await window.xinyuexiaAppIcon.useDataUrl(homeAvatar, 'home-avatar.png');
    setIsBusy(false);
    setIconInfo(result);
    setStatus(result.message ?? (result.ok ? '软件图标已切换为首页图标。' : '切换失败。'));
  };

  const makeDefaultIcon = async () => {
    if (!window.xinyuexiaAppIcon?.makeDefault) {
      setStatus('当前运行环境不支持设置默认图标。');
      return;
    }
    setIsBusy(true);
    const result = await window.xinyuexiaAppIcon.makeDefault();
    setIsBusy(false);
    setIconInfo(result);
    setStatus(result.message ?? (result.ok ? '已将当前图标设为默认图标。' : '设置默认图标失败。'));
  };

  const updateRememberWindowSize = async (rememberSize: boolean) => {
    if (!window.xinyuexiaWindow?.updateSettings) {
      setStatus('当前运行环境不支持窗口大小记忆设置。');
      return;
    }
    const result = await window.xinyuexiaWindow.updateSettings({ rememberSize });
    setWindowSettings(result);
    setStatus(rememberSize ? '已开启窗口大小记忆。' : '已关闭窗口大小记忆，下次启动会使用默认大小。');
  };

  const resetWindowBounds = async () => {
    if (!window.xinyuexiaWindow?.resetBounds) {
      setStatus('当前运行环境不支持恢复默认窗口大小。');
      return;
    }
    const result = await window.xinyuexiaWindow.resetBounds();
    setWindowSettings(result);
    setStatus('已恢复默认窗口大小。');
  };

  return (
    <div
      className={isEmbedded ? 'h-full min-h-0 overflow-hidden' : isPage ? 'h-full min-h-0 overflow-hidden bg-slate-50 px-8 py-6' : 'fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4'}
      onClick={isRouteSurface ? undefined : onClose}
    >
      <div
        data-draggable-managed={isRouteSurface ? undefined : 'true'}
        data-modal-id={isRouteSurface ? undefined : 'dashboard-system-settings'}
        className={isEmbedded ? 'flex h-full min-h-0 w-full flex-col overflow-hidden' : isPage ? SETTINGS_PAGE_SHELL_CLASS : 'relative flex h-[min(720px,calc(100vh-32px))] w-[936px] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'}
        style={isRouteSurface ? undefined : ({
          ...draggable.style,
          maxWidth: 'calc((100vw - 32px) / var(--xinyuexia-effective-scale, 1))',
          maxHeight: 'calc((100vh - 112px) / var(--xinyuexia-effective-scale, 1))',
        } as React.CSSProperties)}
        onClick={(event) => event.stopPropagation()}
      >
        {!isEmbedded && (
        <div {...(isPage ? {} : draggable.dragHandleProps)} className={isPage ? 'flex shrink-0 items-center justify-between border-b border-slate-100 pb-4' : 'flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3'}>
          <div className="flex items-center gap-3">
            {isPage ? (
              <button
                onClick={onClose}
                className={SETTINGS_PAGE_BACK_BUTTON_CLASS}
                title="返回我的小说"
                aria-label="返回我的小说"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}
            <h2 className={isPage ? 'text-2xl font-black text-slate-950' : 'text-base font-bold text-slate-900'}>系统设置</h2>
          </div>
          {!isRouteSurface ? (
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        )}

        <div className={isEmbedded ? 'grid min-h-0 flex-1 grid-cols-[160px_minmax(0,1fr)] gap-5' : isPage ? SETTINGS_PAGE_BODY_CLASS : 'flex min-h-0 flex-1'}>
          <div className={isEmbedded ? 'shrink-0 border-r border-slate-100 pr-4' : isPage ? SETTINGS_PAGE_NAV_CLASS : 'w-36 shrink-0 border-r border-slate-100 bg-slate-50 p-3'}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-bold transition-colors ${
                  activeTab === tab.id
                    ? isEmbedded
                      ? 'bg-[#08AACE] text-white shadow-sm'
                      : 'bg-white text-brand shadow-sm ring-1 ring-slate-100'
                    : isEmbedded
                      ? 'text-slate-600 hover:bg-[#E7F8FD] hover:text-[#08AACE]'
                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={isEmbedded ? 'min-w-0 overflow-y-auto pb-6 pr-1' : isPage ? SETTINGS_PAGE_CONTENT_CLASS : 'min-w-0 flex-1 overflow-y-auto p-4'}>
            {activeTab === 'window' && (
              <div className="space-y-4">
                <section className={isRouteSurface ? 'border-b border-slate-100 pb-4' : 'rounded-2xl border border-slate-100 bg-slate-50 p-4'}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900">记住窗口大小</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        开启后，软件会用上一次关闭前的窗口宽高和位置启动；关闭后，每次启动使用默认窗口大小。
                      </p>
                      <p className="mt-2 text-xs font-bold text-slate-400">
                        当前默认：{windowSettings?.defaultBounds.width ?? 1366} × {windowSettings?.defaultBounds.height ?? 768}
                        {windowSettings?.currentBounds
                          ? `，当前：${windowSettings.currentBounds.width} × ${windowSettings.currentBounds.height}`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void updateRememberWindowSize(!(windowSettings?.rememberSize ?? true))}
                      className={SETTINGS_LIGHT_BUTTON_CLASS}
                    >
                      {(windowSettings?.rememberSize ?? true) ? '已开启' : '已关闭'}
                    </button>
                  </div>
                </section>

                <section className={isRouteSurface ? 'pb-2' : 'rounded-2xl border border-slate-100 bg-white p-4'}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">恢复默认窗口大小</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">把当前窗口恢复到默认宽高，并清掉已保存的窗口尺寸。</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void resetWindowBounds()}
                      className={SETTINGS_LIGHT_BUTTON_CLASS}
                    >
                      恢复默认
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'association' && (
              <div className="space-y-4">
                <div className={isRouteSurface ? 'border-b border-cyan-100 py-3' : 'rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4'}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900">关联有效期</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        本章、上下文、脑洞、其他设定、关联小说等内容只在当前打开软件期间保留；关闭软件后会自动取消，下一次打开恢复未关联。
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-bold text-brand">当前会话</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appIcon' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {iconInfo?.dataUrl ? (
                      <img src={iconInfo.dataUrl} alt="当前软件图标" className="h-full w-full object-contain p-2" />
                    ) : (
                      <span className="text-sm font-bold text-brand">月</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{iconInfo?.isCustom ? '当前使用自定义图标' : '当前使用默认图标'}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{iconInfo?.iconPath ?? '未读取到图标路径'}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">任务栏图标通常需要重启软件后完全刷新；如果 Windows 有缓存，可能还需要重新固定任务栏图标。</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {homeAvatar ? (
                        <img src={homeAvatar} alt="首页图标" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">首页</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">首页图标</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">把首页左上角的图标同步成软件图标。</p>
                      <button
                        onClick={useHomeAvatarIcon}
                        disabled={isBusy || !homeAvatar}
                        className={`mt-2 ${SETTINGS_LIGHT_BUTTON_CLASS}`}
                      >
                        使用首页图标
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="text-sm font-bold text-slate-900">默认图标</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">把当前正在使用的图标保存为默认图标，恢复默认或下次启动时会优先使用它。</p>
                    <button
                      onClick={makeDefaultIcon}
                      disabled={isBusy || !iconInfo?.ok}
                      className={`mt-3 ${SETTINGS_LIGHT_BUTTON_CLASS}`}
                    >
                      设为默认图标
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-700">
                  <p className="font-bold">图标文件夹</p>
                  <p className="mt-1 break-all">{iconDir}</p>
                  <p className="mt-1">这里会读取该文件夹下所有 PNG、JPG、WEBP、ICO 图片，不再要求固定文件名。</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">可选图标</h3>
                    <button
                      onClick={() => void refreshIconInfo()}
                      className={SETTINGS_LIGHT_BUTTON_CLASS}
                    >
                      刷新
                    </button>
                  </div>

                  {projectIcons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                      {supportsProjectIconList
                        ? '没有读取到图片。把图片放进上方文件夹后，点击刷新。'
                        : '需要完整重启软件后，才会读取这个文件夹里的图片。'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {projectIcons.map((icon) => (
                        <div
                          key={icon.fileName}
                          className={`rounded-xl border p-2 ${
                            icon.isSelected ? 'border-brand bg-brand-light' : 'border-slate-100 bg-white'
                          }`}
                        >
                          <div className="flex aspect-square items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                            <img src={icon.dataUrl} alt={icon.fileName} className="h-full w-full object-contain p-2" />
                          </div>
                          <p className="mt-1.5 truncate text-[11px] font-bold text-slate-700" title={icon.fileName}>
                            {icon.fileName}
                          </p>
                          <button
                            onClick={() => void applyProjectIcon(icon.fileName)}
                            disabled={isBusy || icon.isSelected}
                            className={`mt-1.5 w-full ${SETTINGS_LIGHT_BUTTON_CLASS}`}
                          >
                            {icon.isSelected ? '使用中' : '使用'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                  <button
                    onClick={resetIcon}
                    disabled={isBusy}
                    className={SETTINGS_LIGHT_BUTTON_CLASS}
                  >
                    恢复默认
                  </button>
                  <button
                    onClick={selectIcon}
                    disabled={isBusy}
                    className={SETTINGS_LIGHT_BUTTON_CLASS}
                  >
                    上传图片
                  </button>
                </div>

                {status && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{status}</p>}
              </div>
            )}
          </div>
        </div>
        {!isRouteSurface && <ModalResizeHandles draggable={draggable} />}
      </div>
    </div>
  );
}

export function SystemSettingsPage() {
  const navigate = useNavigate();
  const [homeAvatar, setHomeAvatar] = useState(readHomeAvatar);

  useEffect(() => {
    const refreshHomeAvatar = () => setHomeAvatar(readHomeAvatar());
    window.addEventListener('storage', refreshHomeAvatar);
    return () => window.removeEventListener('storage', refreshHomeAvatar);
  }, []);

  return <SystemSettingsModal isOpen onClose={() => navigate('/novels')} homeAvatar={homeAvatar} variant="page" />;
}
