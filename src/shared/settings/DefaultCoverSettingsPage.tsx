import { useRef, useState } from 'react';

import { useDefaultNovelCover } from '@/features/novels/hooks/useDefaultNovelCover';
import { DEFAULT_NOVEL_COVERS, DEFAULT_NOVEL_COVER_GROUPS } from '@/features/novels/model/defaultNovelCover';
import { DEFAULT_COVER_UPLOAD_ACCEPT, prepareDefaultNovelCover } from '@/features/novels/model/defaultNovelCoverUpload';
import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';

export function DefaultCoverSettingsPage() {
  const { selectedCoverId, customCovers, selectDefaultCover, uploadCustomCover, deleteCustomCover } =
    useDefaultNovelCover();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setMessage('正在处理图片…');
    try {
      const prepared = await prepareDefaultNovelCover(file);
      uploadCustomCover(prepared);
      setMessage('自定义默认封面已保存并启用');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '封面上传失败');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-6 pr-1">
      <div
        role="radiogroup"
        aria-label="小说默认封面"
        className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="min-w-0 space-y-5">
          {DEFAULT_NOVEL_COVER_GROUPS.map((group) => {
            const covers = DEFAULT_NOVEL_COVERS.filter((cover) => cover.group === group.id);
            return (
              <section key={group.id} aria-labelledby={`default-cover-group-${group.id}`}>
                <div className="mb-2 flex items-center gap-3">
                  <h4 id={`default-cover-group-${group.id}`} className="text-sm font-black text-slate-800">
                    {group.label}
                  </h4>
                  <span className="text-xs font-bold text-slate-400">{covers.length} 款</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,180px))] gap-2">
                  {covers.map((cover) => {
                    const selected = cover.id === selectedCoverId;
                    const displayLabel = cover.label.replace(/^(普通|简约)/, '');
                    return (
                      <button
                        key={cover.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => selectDefaultCover(cover.id)}
                        className="group min-w-0 text-left focus-visible:outline-none"
                      >
                        <div
                          className="relative mx-auto aspect-[3/4] w-full max-w-[180px] overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition-all group-hover:border-[#08AACE]/50"
                        >
                          <img
                            src={cover.src}
                            alt={`${cover.label}：${cover.name}`}
                            className="h-full w-full object-cover"
                          />
                          {selected ? (
                            <span className="absolute right-2 top-2 rounded-full bg-[#08AACE] px-2 py-1 text-[11px] font-black text-white shadow-sm">
                              当前使用
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 w-full max-w-[180px] truncate text-sm font-black text-slate-900">
                          {displayLabel} <span className="text-[#08AACE]">{cover.name}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="min-w-0" aria-labelledby="default-cover-group-custom">
          <div className="mb-2 flex items-center gap-3">
            <h4 id="default-cover-group-custom" className="text-sm font-black text-slate-800">
              自定义封面
            </h4>
            <span className="text-xs font-bold text-slate-400">{customCovers.length}/20</span>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
            <div>
              <p className="text-sm font-bold text-slate-700">上传默认封面</p>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                支持 JPG、PNG、WebP，最多保留最近 20 张；上传后会自动设为当前使用。
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`${PRIMARY_TEXT_BUTTON_CLASS} mt-3`}
              >
                上传封面
              </button>
              {message ? <p className="mt-2 text-xs font-bold text-[#078FAE]">{message}</p> : null}
              <input
                ref={fileInputRef}
                type="file"
                accept={DEFAULT_COVER_UPLOAD_ACCEPT}
                className="hidden"
                onChange={(event) => void handleUpload(event.target.files?.[0])}
              />
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-black text-slate-800">历史记录</p>
                <span className="text-xs font-bold text-slate-400">最新上传在前</span>
              </div>
              {customCovers.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {customCovers.map((cover, index) => {
                    const selected = selectedCoverId === cover.id;
                    const displayLabel = `自定义${index + 1}号封面`;
                    return (
                      <div key={cover.id} className="min-w-0">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => selectDefaultCover(cover.id)}
                          className="group w-full min-w-0 text-left focus-visible:outline-none"
                        >
                          <div className="relative aspect-[6/7] w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition-all group-hover:border-[#08AACE]/50">
                            <img src={cover.src} alt={displayLabel} className="h-full w-full object-cover" />
                            {selected ? (
                              <span className="absolute right-2 top-2 rounded-full bg-[#08AACE] px-2 py-1 text-[11px] font-black text-white shadow-sm">
                                当前使用
                              </span>
                            ) : null}
                          </div>
                        </button>
                        <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
                          <p className="min-w-0 truncate text-xs font-black text-slate-900">{displayLabel}</p>
                          <button
                            type="button"
                            onClick={() => {
                              deleteCustomCover(cover.id);
                              setMessage(selected ? '已删除当前自定义封面，恢复简约2号月轨' : '已删除自定义封面');
                            }}
                            className="shrink-0 text-xs font-bold text-red-500 hover:text-red-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs font-bold text-slate-400">
                  尚未上传自定义封面
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
