import { Image } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { NewNovelInput, NovelChannel, WorkType } from '@/features/novels/model/novelTypes';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { ActionButton } from '@/shared/ui/ActionButton';

interface NewNovelModalProps {
  isOpen: boolean;
  type: WorkType;
  categories: string[];
  onClose: () => void;
  onCreate: (input: NewNovelInput) => void;
}

export function NewNovelModal({ isOpen, type, categories, onClose, onCreate }: NewNovelModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0] ?? '未分类');
  const [channel, setChannel] = useState<NovelChannel>('male');
  const [synopsis, setSynopsis] = useState('');
  const [cover, setCover] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    setTitle(type === 'novel' ? '默认小说' : '默认剧本');
    setCategory(categories[0] ?? '未分类');
    setChannel('male');
    setSynopsis('');
    setCover(undefined);
  }, [categories, isOpen, type]);

  if (!isOpen) return null;

  const typeLabel = type === 'novel' ? '小说' : '剧本';

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate({ title: trimmed, category, channel: type === 'novel' ? channel : undefined, synopsis, type, cover });
    onClose();
  };

  const handleCoverFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setCover(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  return (
    <AppModalShell
      title={`新建${typeLabel}`}
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[420px]"
      heightClass=""
      zIndexClass="z-50"
      contentClassName="p-5"
    >
      <label className="mb-1.5 block text-xs font-medium text-gray-600">作品名称</label>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleSubmit();
        }}
        className="mb-4 w-full rounded-md border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-brand"
        autoFocus
      />

      {type === 'novel' ? (
        <>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">频道</label>
          <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-md border border-gray-200 bg-white">
            {([
              { value: 'male', label: '男频' },
              { value: 'female', label: '女频' },
            ] as const).map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={channel === item.value}
                onClick={() => setChannel(item.value)}
                className={`h-9 text-sm font-semibold transition-colors ${
                  channel === item.value
                    ? 'border-[#08AACE] bg-[#EAF9FD] text-[#078FAB] shadow-[inset_0_0_0_1px_#08AACE]'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <label className="mb-1.5 block text-xs font-medium text-gray-600">题材类型</label>
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="mb-4 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:border-brand"
      >
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label className="mb-1.5 block text-xs font-medium text-gray-600">简介</label>
      <textarea
        value={synopsis}
        onChange={(event) => setSynopsis(event.target.value)}
        className="mb-5 h-24 w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-brand"
        placeholder="可以先留空"
      />

      <label className="mb-1.5 block text-xs font-medium text-gray-600">封面</label>
      <div className="mb-5 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50">
          <Image className="h-3.5 w-3.5" />
          上传图片
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleCoverFile(event.target.files?.[0])}
          />
        </label>
        {cover && (
          <>
            <img src={cover} alt="封面预览" className="h-12 w-9 rounded object-cover" />
            <button onClick={() => setCover(undefined)} className="text-xs text-red-500 hover:underline">
              移除
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <ActionButton onClick={onClose} variant="secondary" size="sm">
          取消
        </ActionButton>
        <ActionButton onClick={handleSubmit} size="sm">
          确认
        </ActionButton>
      </div>
    </AppModalShell>
  );
}
