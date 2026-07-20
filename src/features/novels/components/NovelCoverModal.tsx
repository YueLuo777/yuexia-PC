import { Image as ImageIcon, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useCoverLibrary } from '@/features/covers/hooks/useCoverLibrary';
import type { Novel } from '@/features/novels/model/novelTypes';

export function CoverModal({
  isOpen,
  novel,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  novel: Novel | null;
  onClose: () => void;
  onSave: (cover?: string) => void;
}) {
  type CoverTab = 'upload' | 'library';
  const { items: coverItems } = useCoverLibrary();
  const [value, setValue] = useState('');
  const [activeTab, setActiveTab] = useState<CoverTab>('upload');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setValue(novel?.cover ?? '');
    setMessage('');
  }, [novel]);

  if (!isOpen || !novel) return null;

  const relatedCovers = coverItems.filter((item) => item.workType === novel.type);

  const handleFileUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setValue(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex h-[720px] w-[860px] max-w-[94vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">设置封面</h2>
          <p className="mt-0.5 text-xs text-gray-400">{novel.title}</p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)] overflow-hidden">
          <aside className="border-r border-gray-100 bg-gray-50 p-5">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {value ? (
                <img src={value} alt="封面预览" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="mb-2 h-10 w-10" />
                  <span className="text-sm">暂无封面</span>
                </div>
              )}
            </div>
            {message && (
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs leading-5 text-gray-500">{message}</div>
            )}
          </aside>

          <main className="flex min-h-0 flex-col">
            <div className="flex shrink-0 gap-2 border-b border-gray-100 px-5 py-3">
              {(
                [
                  { id: 'upload', label: '上传封面' },
                  { id: 'library', label: '封面库' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500 hover:border-brand hover:bg-brand-light/30">
                    <Upload className="mb-2 h-6 w-6 text-gray-300" />
                    点击选择本地图片
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleFileUpload(event.target.files?.[0])}
                    />
                  </label>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-600">封面地址</label>
                    <input
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder="输入图片 URL 或 data URL"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'library' &&
                (relatedCovers.length === 0 ? (
                  <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
                    封面库暂无{novel.type === 'script' ? '剧本' : '小说'}封面
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                    {relatedCovers.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setValue(item.image);
                          setMessage(`已选择封面：${item.title}`);
                        }}
                        className={`overflow-hidden rounded-xl border bg-white text-left transition-colors ${
                          value === item.image
                            ? 'border-brand ring-1 ring-brand'
                            : 'border-gray-100 hover:border-brand/50'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-gray-100">
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-2">
                          <div className="truncate text-xs font-medium text-gray-700">{item.title}</div>
                          <div className="mt-0.5 truncate text-[10px] text-gray-400">
                            {item.modelName ?? item.createdAt}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          </main>
        </div>

        <div className="flex justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => onSave(undefined)}
            className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
          >
            清空封面
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={() => onSave(value.trim() || undefined)}
              className="rounded-lg bg-brand px-5 py-2 text-xs text-white hover:bg-brand-dark"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
