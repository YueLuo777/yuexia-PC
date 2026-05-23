import { ArrowLeft, Image, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCoverLibrary } from '@/features/covers/hooks/useCoverLibrary';

interface CoverLibraryPageProps {
  embedded?: boolean;
}

export function CoverLibraryPage({ embedded = false }: CoverLibraryPageProps = {}) {
  const navigate = useNavigate();
  const { items, deleteItem } = useCoverLibrary();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/materials');
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="border-b border-slate-100 bg-white px-7 py-6">
        <div className="flex items-center gap-3">
          {!embedded && (
            <button
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
              title="返回资料库"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <Image className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-slate-900">封面库</h1>
            <p className="mt-1 text-sm text-slate-400">保存的小说封面和剧本封面会显示在这里。</p>
          </div>
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        {items.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white">
            <Image className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-base text-slate-400">暂无封面</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-sm">
                <div className="aspect-[3/4] bg-slate-100">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="truncate text-sm font-bold text-slate-900" title={item.title}>{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.workType === 'script' ? '剧本封面' : '小说封面'} · {item.createdAt}</div>
                  {item.modelName && <div className="mt-1 truncate text-xs text-slate-400">模型：{item.modelName}</div>}
                  {item.prompt && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.prompt}</p>}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
