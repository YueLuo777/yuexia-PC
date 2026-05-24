import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';

type SettingsTab = 'appIcon';

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'appIcon', label: '软件图标' },
];

export function SystemSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useTopModalEscape(isOpen, onClose);
  const [activeTab, setActiveTab] = useState<SettingsTab>('appIcon');
  const [iconInfo, setIconInfo] = useState<AppIconResult | null>(null);
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

  useEffect(() => {
    if (!isOpen) return;
    setStatus('');
    setActiveTab('appIcon');
    void refreshIconInfo();
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

  const useProjectIcon = async (fileName: string) => {
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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex h-[min(720px,calc(100vh-32px))] w-[720px] max-w-[92vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">系统设置</h2>
            <p className="mt-0.5 text-xs text-slate-400">管理软件本身的显示与运行偏好。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="w-36 shrink-0 border-r border-slate-100 bg-slate-50 p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mb-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                  activeTab === tab.id ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto p-4">
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
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
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
                            onClick={() => void useProjectIcon(icon.fileName)}
                            disabled={isBusy || icon.isSelected}
                            className={`mt-1.5 w-full rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${
                              icon.isSelected
                                ? 'cursor-default bg-brand text-white'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300'
                            }`}
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
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    恢复默认
                  </button>
                  <button
                    onClick={selectIcon}
                    disabled={isBusy}
                    className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:bg-slate-300"
                  >
                    上传图片
                  </button>
                </div>

                {status && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{status}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
